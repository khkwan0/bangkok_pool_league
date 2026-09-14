import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useLeague} from '@/hooks'
import {useTournaments} from '@/hooks/useTournaments'
import {useLocalSearchParams, useRouter} from 'expo-router'
import React from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  useColorScheme,
} from 'react-native'

type BracketMatch = {
  match_id: number
  bracket_side: string
  round: number
  position: number
  home_display: string | null
  away_display: string | null
  status_id: number
  home_frames: number | null
  away_frames: number | null
  date: string | null
  venue_name?: string | null
  home_team_id?: number | null
  away_team_id?: number | null
}

type BracketStage = {
  stage_key: string
  label: string
  stage_order: number
  matches: BracketMatch[]
}

export default function CupBracketScreen() {
  const {id} = useLocalSearchParams<{id: string}>()
  const tournamentId = Number(id)
  const api = useTournaments()
  const league = useLeague()
  const router = useRouter()
  const isDark = useColorScheme() === 'dark'
  const [name, setName] = React.useState('')
  const [status, setStatus] = React.useState('')
  const [stages, setStages] = React.useState<BracketStage[]>([])
  const [loading, setLoading] = React.useState(true)
  const [openingId, setOpeningId] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!tournamentId) return
    setLoading(true)
    api
      .getBracket(tournamentId)
      .then((res: any) => {
        if (res?.status === 'ok') {
          setName(res.tournament?.name ?? '')
          setStatus(res.tournament?.status ?? '')
          setStages(Array.isArray(res.stages) ? res.stages : [])
        }
      })
      .finally(() => setLoading(false))
  }, [tournamentId])

  async function openMatch(match: BracketMatch) {
    if (!match.match_id || !match.home_team_id || !match.away_team_id) return
    setOpeningId(match.match_id)
    try {
      const res = await league.GetMatchById(match.match_id)
      const info =
        res?.status === 'ok' && res.data
          ? res.data
          : res?.match_id
            ? res
            : null
      if (info) {
        router.push({
          pathname: '/Match',
          params: {params: JSON.stringify(info)},
        })
      }
    } finally {
      setOpeningId(null)
    }
  }

  if (loading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <ScrollView
      horizontal={false}
      contentContainerStyle={{padding: 16, paddingBottom: 40}}>
      <Text style={{fontSize: 22, fontWeight: '800'}}>{name}</Text>
      <Text style={{marginTop: 4, opacity: 0.6, textTransform: 'capitalize'}}>
        {status.replace(/_/g, ' ')}
      </Text>

      {stages.map(stage => {
        const byRound = new Map<number, BracketMatch[]>()
        for (const m of stage.matches) {
          const list = byRound.get(m.round) ?? []
          list.push(m)
          byRound.set(m.round, list)
        }
        const rounds = [...byRound.keys()].sort((a, b) => a - b)
        return (
          <View key={stage.stage_key} style={{marginTop: 24}}>
            <Text style={{fontSize: 17, fontWeight: '700', marginBottom: 10}}>
              {stage.label}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {rounds.map(round => (
                <View key={round} style={{width: 200, marginRight: 12}}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      opacity: 0.5,
                      marginBottom: 8,
                      textTransform: 'uppercase',
                    }}>
                    Round {round}
                  </Text>
                  {(byRound.get(round) ?? [])
                    .sort((a, b) => a.position - b.position)
                    .map(m => {
                      const playable =
                        !!m.home_team_id &&
                        !!m.away_team_id &&
                        m.status_id !== 3
                      return (
                        <Pressable
                          key={m.match_id}
                          disabled={!playable || openingId === m.match_id}
                          onPress={() => openMatch(m)}
                          style={{
                            marginBottom: 10,
                            padding: 12,
                            borderRadius: 10,
                            backgroundColor: isDark ? '#1f1f1f' : '#fff',
                            borderWidth: 1,
                            borderColor: isDark ? '#333' : '#e2e8f0',
                            opacity: playable ? 1 : 0.85,
                          }}>
                          <Text style={{fontWeight: '600'}}>
                            {m.home_display || 'TBD'}
                            {m.status_id === 3
                              ? `  ${m.home_frames ?? 0}`
                              : ''}
                          </Text>
                          <Text style={{fontWeight: '600', marginTop: 4}}>
                            {m.away_display || 'TBD'}
                            {m.status_id === 3
                              ? `  ${m.away_frames ?? 0}`
                              : ''}
                          </Text>
                          <Text
                            style={{
                              marginTop: 6,
                              fontSize: 11,
                              opacity: 0.55,
                            }}>
                            {m.bracket_side}
                            {m.venue_name ? ` · ${m.venue_name}` : ''}
                            {m.date ? ` · ${String(m.date).slice(0, 10)}` : ''}
                          </Text>
                        </Pressable>
                      )
                    })}
                </View>
              ))}
            </ScrollView>
          </View>
        )
      })}
    </ScrollView>
  )
}
