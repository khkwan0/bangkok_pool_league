import Button from '@/components/Button'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {MiniMatchCard} from '@/components/mini-leagues/MiniMatchCard'
import LiveScores from '@/components/upcoming/LiveScores'
import {useLeagueContext} from '@/context/LeagueContext'
import {useLeague} from '@/hooks'
import {useMiniLeagues} from '@/hooks/useMiniLeagues'
import {useTabListContentContainerStyle} from '@/hooks/useTabListContentContainerStyle'
import {useThemeColor} from '@/hooks/useThemeColor'
import {
  NON_CANONICAL_ACCENT,
  NON_CANONICAL_ACCENT_SOFT,
  NON_CANONICAL_ACCENT_SOFT_DARK,
} from '@/types/competition'
import {
  MiniSeasonChips,
  useMiniSeasonSelection,
} from '@/components/mini-leagues/MiniSeasonChips'
import {router} from 'expo-router'
import React from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View as RNView,
  useColorScheme,
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
  round?: number | null
  tournament_id?: number | null
}

export function MiniLeagueHome({miniLeagueId}: {miniLeagueId: number}) {
  const api = useMiniLeagues()
  const apiRef = React.useRef(api)
  apiRef.current = api
  const league = useLeague()
  const screenBg = useThemeColor({}, 'background')
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const {state, StopRefreshUpcoming, apiUrl} = useLeagueContext()
  const [matches, setMatches] = React.useState<MiniMatch[]>([])
  const [mini, setMini] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [openingId, setOpeningId] = React.useState<number | null>(null)
  const listContentStyle = useTabListContentContainerStyle({
    backgroundColor: screenBg,
    flexGrow: 1,
    paddingTop: 4,
    paddingBottom: 24,
  })
  const {seasons, seasonId, setSeasonId} = useMiniSeasonSelection(miniLeagueId)

  const load = React.useCallback(async () => {
    const opts =
      seasonId != null && Number(seasonId) > 0
        ? {season_id: Number(seasonId)}
        : undefined
    const [m, mt] = await Promise.all([
      apiRef.current.get(miniLeagueId),
      apiRef.current.listMatches(miniLeagueId, opts),
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
  }, [miniLeagueId, apiUrl, seasonId])

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
        <ActivityIndicator color={NON_CANONICAL_ACCENT} />
      </View>
    )
  }

  const soft = isDark
    ? NON_CANONICAL_ACCENT_SOFT_DARK
    : NON_CANONICAL_ACCENT_SOFT

  return (
    <View className="flex-1" style={{backgroundColor: screenBg}}>
      {(typeof state.showLiveScores === 'undefined' || state.showLiveScores) && (
        <LiveScores />
      )}
      <RNView style={{paddingHorizontal: 12, paddingTop: 8}}>
        <Pressable
          onPress={() => router.push('/(tabs)/(index)/cups')}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 12,
            backgroundColor: soft,
            borderWidth: 1,
            borderColor: isDark ? '#5C1A3A' : '#F8BBD0',
            marginBottom: 8,
            alignItems: 'center',
          }}>
          <Text style={{fontWeight: '700', color: NON_CANONICAL_ACCENT}}>
            Cups & tournaments
          </Text>
        </Pressable>
        <MiniSeasonChips
          seasons={seasons}
          seasonId={seasonId}
          onSelect={setSeasonId}
        />
      </RNView>
      <RNView
        style={{
          marginHorizontal: 8,
          marginTop: 12,
          marginBottom: 10,
          paddingVertical: 18,
          paddingHorizontal: 18,
          borderRadius: 16,
          backgroundColor: soft,
          borderWidth: 1,
          borderColor: isDark ? '#5C1A3A' : '#F8BBD0',
        }}>
        <RNView
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}>
          <RNView style={{flex: 1, minWidth: 0, paddingRight: 4}}>
            <Text
              style={{
                color: NON_CANONICAL_ACCENT,
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 0.8,
              }}>
              UPCOMING
            </Text>
            <Text
              numberOfLines={1}
              style={{fontSize: 16, fontWeight: '800', marginTop: 4}}>
              {matches.length} open match{matches.length === 1 ? '' : 'es'}
            </Text>
            <Text style={{fontSize: 12, opacity: 0.65, marginTop: 4}}>
              {mini?.is_admin ? 'Admin' : 'Member'}
            </Text>
          </RNView>
          <RNView
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingLeft: 4,
            }}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/teams/mini-leagues/[id]',
                  params: {id: String(miniLeagueId)},
                })
              }
              accessibilityRole="button"
              accessibilityLabel="Manage mini league"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#fff',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: isDark ? '#5C1A3A' : '#F8BBD0',
              }}>
              <MCI name="cog-outline" size={22} color={NON_CANONICAL_ACCENT} />
            </Pressable>
            {mini?.is_admin ? (
              <Button
                small
                onPress={() =>
                  router.push({
                    pathname: '/teams/mini-leagues/[id]/create-match',
                    params: {id: String(miniLeagueId)},
                  })
                }>
                <Text className="text-white">New</Text>
              </Button>
            ) : null}
          </RNView>
        </RNView>
      </RNView>

      <FlatList
        data={matches}
        keyExtractor={item => String(item.id)}
        style={{flex: 1, backgroundColor: screenBg}}
        contentContainerStyle={listContentStyle}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={NON_CANONICAL_ACCENT}
            colors={[NON_CANONICAL_ACCENT]}
          />
        }
        ListEmptyComponent={
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 24,
              paddingVertical: 36,
              paddingHorizontal: 20,
              borderRadius: 16,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: isDark ? '#444' : '#CBD5E1',
              alignItems: 'center',
            }}>
            <MCI
              name="billiards-rack"
              size={36}
              color={NON_CANONICAL_ACCENT}
              style={{opacity: 0.8, marginBottom: 10}}
            />
            <Text style={{fontWeight: '700', fontSize: 16, textAlign: 'center'}}>
              No open matches
            </Text>
            <Text
              style={{
                opacity: 0.6,
                textAlign: 'center',
                marginTop: 6,
                lineHeight: 20,
              }}>
              {mini?.is_admin
                ? 'Create a match to get started.'
                : 'Ask an admin to schedule the next match.'}
            </Text>
            {mini?.is_admin ? (
              <View style={{marginTop: 16}}>
                <Button
                  small
                  onPress={() =>
                    router.push({
                      pathname: '/teams/mini-leagues/[id]/create-match',
                      params: {id: String(miniLeagueId)},
                    })
                  }>
                  <Text className="text-white">Create match</Text>
                </Button>
              </View>
            ) : null}
          </View>
        }
        renderItem={({item}) => (
          <MiniMatchCard
            item={item}
            opening={openingId === item.id}
            onPress={() => openMatch(item.id)}
          />
        )}
      />
    </View>
  )
}
