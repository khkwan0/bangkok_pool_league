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
  home_tournament_team_id?: number | null
  away_tournament_team_id?: number | null
}

type BracketStage = {
  stage_key: string
  label: string
  stage_order: number
  matches: BracketMatch[]
}

type CompletedMatch = {
  match_id: number
  date: string | null
  home_display: string | null
  away_display: string | null
  home_frames: number | null
  away_frames: number | null
  home_team_id: number | null
  away_team_id: number | null
  venue_name: string | null
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
  const [completed, setCompleted] = React.useState<CompletedMatch[]>([])
  const [loading, setLoading] = React.useState(true)
  const [openingId, setOpeningId] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!tournamentId) return
    setLoading(true)
    Promise.all([
      api.getBracket(tournamentId),
      api.getCompletedMatches(tournamentId),
    ])
      .then(([bracketRes, completedRes]: any[]) => {
        if (bracketRes?.status === 'ok') {
          setName(bracketRes.tournament?.name ?? '')
          setStatus(bracketRes.tournament?.status ?? '')
          setStages(Array.isArray(bracketRes.stages) ? bracketRes.stages : [])
        }
        if (completedRes?.status === 'ok') {
          setCompleted(
            Array.isArray(completedRes.matches) ? completedRes.matches : [],
          )
        }
      })
      .finally(() => setLoading(false))
  }, [tournamentId])

  function scoringIds(match: {
    home_team_id?: number | null
    away_team_id?: number | null
    home_tournament_team_id?: number | null
    away_tournament_team_id?: number | null
  }) {
    const home =
      match.home_team_id || match.home_tournament_team_id || null
    const away =
      match.away_team_id || match.away_tournament_team_id || null
    return {home, away}
  }

  async function openMatch(match: {
    match_id: number
    home_team_id?: number | null
    away_team_id?: number | null
    home_tournament_team_id?: number | null
    away_tournament_team_id?: number | null
    status_id?: number
  }) {
    const {home, away} = scoringIds(match)
    if (!match.match_id || !home || !away) return
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
        const payload = {
          ...info,
          home_team_id: info.home_team_id || home,
          away_team_id: info.away_team_id || away,
        }
        if (match.status_id === 3 || Number(info.status_id) === 3) {
          router.push({
            pathname: '/completed/Match',
            params: {
              params: JSON.stringify({matchId: match.match_id}),
            },
          })
          return
        }
        router.push({
          pathname: '/Match',
          params: {params: JSON.stringify(payload)},
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
                      const {home, away} = scoringIds(m)
                      const playable =
                        !!home && !!away && m.status_id !== 3
                      return (
                        <Pressable
                          key={m.match_id}
                          disabled={
                            (!playable && m.status_id !== 3) ||
                            openingId === m.match_id
                          }
                          onPress={() => openMatch(m)}
                          style={{
                            marginBottom: 10,
                            padding: 12,
                            borderRadius: 10,
                            backgroundColor: isDark ? '#1f1f1f' : '#fff',
                            borderWidth: 1,
                            borderColor: isDark ? '#333' : '#e2e8f0',
                            opacity: playable || m.status_id === 3 ? 1 : 0.85,
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

      {completed.length > 0 ? (
        <View style={{marginTop: 28}}>
          <Text style={{fontSize: 17, fontWeight: '700', marginBottom: 10}}>
            Completed matches
          </Text>
          {completed.map(m => (
            <Pressable
              key={`c-${m.match_id}`}
              disabled={openingId === m.match_id}
              onPress={() =>
                openMatch({
                  match_id: m.match_id,
                  home_team_id: m.home_team_id,
                  away_team_id: m.away_team_id,
                  status_id: 3,
                })
              }
              style={{
                marginBottom: 10,
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#1f1f1f' : '#fff',
                borderWidth: 1,
                borderColor: isDark ? '#333' : '#e2e8f0',
              }}>
              <Text style={{fontWeight: '600'}}>
                {m.home_display || 'TBD'} {m.home_frames ?? 0} –{' '}
                {m.away_frames ?? 0} {m.away_display || 'TBD'}
              </Text>
              <Text style={{marginTop: 6, fontSize: 11, opacity: 0.55}}>
                #{m.match_id}
                {m.date ? ` · ${String(m.date).slice(0, 10)}` : ''}
                {m.venue_name ? ` · ${m.venue_name}` : ''}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </ScrollView>
  )
}
