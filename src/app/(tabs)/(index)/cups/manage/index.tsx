import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useLeagueContext} from '@/context/LeagueContext'
import {useMiniLeagues} from '@/hooks/useMiniLeagues'
import {useTournaments} from '@/hooks/useTournaments'
import {isMiniCompetition} from '@/types/competition'
import {useFocusEffect, useLocalSearchParams, useRouter} from 'expo-router'
import React from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  useColorScheme,
} from 'react-native'

type CupRow = {
  id: number
  name: string
  status: string
  game_type_label?: string
  entry_count?: number
  participant_mode?: string
}

function scopeFromParams(miniLeagueId: number | null) {
  if (miniLeagueId && miniLeagueId > 0) {
    return {type: 'mini' as const, id: miniLeagueId}
  }
  return {type: 'site' as const}
}

export default function CupsManageScreen() {
  const params = useLocalSearchParams<{mini_league_id?: string}>()
  const paramMiniId = Number(params.mini_league_id || 0) || null
  const api = useTournaments()
  const miniApi = useMiniLeagues()
  const apiRef = React.useRef(api)
  const miniApiRef = React.useRef(miniApi)
  apiRef.current = api
  miniApiRef.current = miniApi
  const {state} = useLeagueContext()
  const router = useRouter()
  const isDark = useColorScheme() === 'dark'
  const [rows, setRows] = React.useState<CupRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [allowed, setAllowed] = React.useState(false)
  const [denied, setDenied] = React.useState(false)

  const competition = state.competition
  const miniLeagueId =
    paramMiniId ??
    (isMiniCompetition(competition) ? competition.id : null)
  const scope = scopeFromParams(miniLeagueId)
  const isSiteAdmin = Number(state.user?.role_id) === 9
  const miniId = scope.type === 'mini' ? scope.id : 0
  const scopeType = scope.type

  const load = React.useCallback(async () => {
    const currentScope =
      scopeType === 'mini' ? {type: 'mini' as const, id: miniId} : {type: 'site' as const}
    let canManage = isSiteAdmin
    if (currentScope.type === 'mini') {
      const m = await miniApiRef.current.get(miniId)
      canManage = isSiteAdmin || Boolean(m?.data?.is_admin)
    }
    if (!canManage) {
      setAllowed(false)
      setDenied(true)
      setRows([])
      return
    }
    setAllowed(true)
    setDenied(false)
    const res = await apiRef.current.adminList(currentScope)
    if (res?.status === 'ok') {
      setRows(Array.isArray(res.tournaments) ? res.tournaments : [])
    } else {
      setRows([])
    }
  }, [isSiteAdmin, miniId, scopeType])

  const hasHydrated = React.useRef(false)

  React.useEffect(() => {
    hasHydrated.current = false
    setLoading(true)
  }, [miniId, scopeType])

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false
      if (!hasHydrated.current) setLoading(true)
      load().finally(() => {
        if (!cancelled) {
          hasHydrated.current = true
          setLoading(false)
        }
      })
      return () => {
        cancelled = true
      }
    }, [load]),
  )

  if (loading && !hasHydrated.current) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator />
      </View>
    )
  }

  if (denied || !allowed) {
    return (
      <View style={{flex: 1, padding: 24, justifyContent: 'center'}}>
        <Text style={{textAlign: 'center', opacity: 0.7}}>
          Only league or mini-league admins can manage cups.
        </Text>
      </View>
    )
  }

  return (
    <View style={{flex: 1}}>
      <View style={{paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4}}>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/(tabs)/(index)/cups/manage/create',
              params: miniLeagueId
                ? {mini_league_id: String(miniLeagueId)}
                : {},
            })
          }
          style={{
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: 'center',
            backgroundColor: isDark ? '#2563eb' : '#1d4ed8',
          }}>
          <Text style={{color: '#fff', fontWeight: '700'}}>Create cup</Text>
        </Pressable>
        <Text style={{marginTop: 8, fontSize: 12, opacity: 0.55}}>
          {scope.type === 'mini'
            ? 'Managing cups for this mini league (includes drafts).'
            : 'Managing canonical league cups (includes drafts).'}
        </Text>
      </View>
      <FlatList
        data={rows}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{padding: 16, gap: 10, flexGrow: 1}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true)
              await load()
              setRefreshing(false)
            }}
          />
        }
        ListEmptyComponent={
          <Text style={{opacity: 0.6, textAlign: 'center', marginTop: 40}}>
            No cups yet. Create one to get started.
          </Text>
        }
        renderItem={({item}) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(tabs)/(index)/cups/manage/[tournamentId]',
                params: {
                  tournamentId: String(item.id),
                  ...(miniLeagueId
                    ? {mini_league_id: String(miniLeagueId)}
                    : {}),
                },
              })
            }
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: isDark ? '#1f1f1f' : '#fff',
              borderWidth: 1,
              borderColor: isDark ? '#333' : '#e2e8f0',
            }}>
            <Text style={{fontWeight: '700', fontSize: 16}}>{item.name}</Text>
            <Text style={{marginTop: 4, opacity: 0.65, fontSize: 13}}>
              {String(item.status || '').replace(/_/g, ' ')}
              {item.participant_mode ? ` · ${item.participant_mode}` : ''}
              {item.game_type_label ? ` · ${item.game_type_label}` : ''}
              {item.entry_count != null ? ` · ${item.entry_count} entries` : ''}
            </Text>
          </Pressable>
        )}
      />
    </View>
  )
}
