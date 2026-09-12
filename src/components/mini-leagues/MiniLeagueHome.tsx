import Button from '@/components/Button'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import LiveScores from '@/components/upcoming/LiveScores'
import {useLeagueContext} from '@/context/LeagueContext'
import {useLeague} from '@/hooks'
import {useMiniLeagues} from '@/hooks/useMiniLeagues'
import {useTabListContentContainerStyle} from '@/hooks/useTabListContentContainerStyle'
import {formatBangkokDateMed} from '@/lib/bangkokTime'
import {useTheme} from 'expo-router/react-navigation'
import {router} from 'expo-router'
import React from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native'

function matchInfoFromResponse(res: unknown): Record<string, unknown> | null {
  if (!res || typeof res !== 'object') return null
  const payload = res as {status?: string; data?: unknown; match_id?: unknown}
  if (payload.status === 'ok' && payload.data && typeof payload.data === 'object') {
    return payload.data as Record<string, unknown>
  }
  if (typeof payload.match_id !== 'undefined') {
    return payload as Record<string, unknown>
  }
  return null
}

type MiniMatch = {
  id: number
  date: string
  status_id: number
  home_team_name?: string
  away_team_name?: string
  home_frames?: number | null
  away_frames?: number | null
}

export function MiniLeagueHome({miniLeagueId}: {miniLeagueId: number}) {
  const api = useMiniLeagues()
  const apiRef = React.useRef(api)
  apiRef.current = api
  const league = useLeague()
  const {colors} = useTheme()
  const {state, StopRefreshUpcoming, apiUrl} = useLeagueContext()
  const [matches, setMatches] = React.useState<MiniMatch[]>([])
  const [mini, setMini] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [openingId, setOpeningId] = React.useState<number | null>(null)
  const listContentStyle = useTabListContentContainerStyle({
    backgroundColor: colors.background,
  })

  const load = React.useCallback(async () => {
    const [m, mt] = await Promise.all([
      apiRef.current.get(miniLeagueId),
      apiRef.current.listMatches(miniLeagueId),
    ])
    if (m?.status === 'ok') setMini(m.data)
    if (mt?.status === 'ok') {
      const all: MiniMatch[] = mt.data || []
      setMatches(
        all
          .filter(x => Number(x.status_id) === 1)
          .sort((a, b) => String(a.date).localeCompare(String(b.date))),
      )
    }
  }, [miniLeagueId, apiUrl])

  React.useEffect(() => {
    setLoading(true)
    load().finally(() => {
      setLoading(false)
      if (state.refreshUpcoming) {
        StopRefreshUpcoming()
      }
    })
  }, [load, state.refreshUpcoming, StopRefreshUpcoming])

  async function onRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  async function openMatch(matchId: number) {
    if (openingId) return
    setOpeningId(matchId)
    try {
      // @ts-expect-error runtime method
      const res = await league.GetMatchById(matchId)
      const matchInfo = matchInfoFromResponse(res)
      if (matchInfo) {
        router.push({
          pathname: '/Match',
          params: {params: JSON.stringify(matchInfo)},
        })
      }
    } finally {
      setOpeningId(null)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <View className="flex-1">
      {(typeof state.showLiveScores === 'undefined' || state.showLiveScores) && (
        <LiveScores />
      )}
      <View className="px-4 pt-3 pb-2 flex-row items-center justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-sm opacity-70">
            {mini?.is_admin ? 'Admin' : 'Member'} · upcoming matches
          </Text>
        </View>
        {mini?.is_admin ? (
          <Button
            small
            onPress={() =>
              router.push({
                pathname: '/teams/mini-leagues/[id]/create-match',
                params: {id: String(miniLeagueId)},
              })
            }>
            <Text className="text-white">New match</Text>
          </Button>
        ) : null}
      </View>
      <View className="px-4 pb-2 flex-row flex-wrap gap-2">
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/teams/mini-leagues/[id]',
              params: {id: String(miniLeagueId)},
            })
          }>
          <Text style={{color: colors.primary, fontWeight: '600'}}>
            Manage
          </Text>
        </Pressable>
      </View>
      <FlatList
        data={matches}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={listContentStyle}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text className="text-center opacity-60 mt-10 px-4">
            No open matches in this mini league.
          </Text>
        }
        renderItem={({item}) => (
          <Pressable
            onPress={() => openMatch(item.id)}
            disabled={openingId === item.id}
            className="mx-4 my-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <Text className="font-semibold">
              {item.home_team_name || 'Home'} vs{' '}
              {item.away_team_name || 'Away'}
            </Text>
            <Text className="text-sm opacity-70 mt-1">
              {formatBangkokDateMed(item.date)} · #{item.id}
              {openingId === item.id ? ' · opening…' : ''}
            </Text>
          </Pressable>
        )}
      />
    </View>
  )
}
