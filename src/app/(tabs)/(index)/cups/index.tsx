import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useLeagueContext} from '@/context/LeagueContext'
import {useMiniLeagues} from '@/hooks/useMiniLeagues'
import {useTournaments} from '@/hooks/useTournaments'
import {isMiniCompetition} from '@/types/competition'
import {useRouter} from 'expo-router'
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
  open_signup?: boolean
}

export default function CupsListScreen() {
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
  const [canManage, setCanManage] = React.useState(false)

  const competition = state.competition
  const isMini = isMiniCompetition(competition)
  const miniId = isMini ? competition.id : 0
  const isSiteAdmin = Number(state.user?.role_id) === 9

  const load = React.useCallback(async () => {
    const opts = isMini ? {mini_league_id: miniId} : undefined
    const res = await apiRef.current.list(opts)
    if (res?.status === 'ok') {
      setRows(Array.isArray(res.data) ? res.data : [])
    }
    if (isSiteAdmin) {
      setCanManage(true)
    } else if (isMini) {
      const m = await miniApiRef.current.get(miniId)
      setCanManage(Boolean(m?.data?.is_admin))
    } else {
      setCanManage(false)
    }
  }, [isMini, isSiteAdmin, miniId])

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    load().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [load])

  if (loading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <View style={{flex: 1}}>
      {canManage ? (
        <View style={{paddingHorizontal: 16, paddingTop: 12}}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(tabs)/(index)/cups/manage',
                params: isMini ? {mini_league_id: String(miniId)} : {},
              })
            }
            style={{
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: isDark ? '#2563eb' : '#1d4ed8',
            }}>
            <Text style={{color: '#fff', fontWeight: '700'}}>
              Manage cups
            </Text>
          </Pressable>
        </View>
      ) : null}
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
            No cups yet in this competition.
          </Text>
        }
        renderItem={({item}) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(tabs)/(index)/cups/[id]',
                params: {id: String(item.id)},
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
              {item.status.replace(/_/g, ' ')}
              {item.open_signup && item.status === 'draft'
                ? ' · open signup'
                : ''}
              {item.game_type_label ? ` · ${item.game_type_label}` : ''}
              {item.entry_count != null ? ` · ${item.entry_count} entries` : ''}
            </Text>
          </Pressable>
        )}
      />
    </View>
  )
}
