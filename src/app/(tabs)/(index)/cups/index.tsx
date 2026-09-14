import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useLeagueContext} from '@/context/LeagueContext'
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
}

export default function CupsListScreen() {
  const api = useTournaments()
  const {state} = useLeagueContext()
  const router = useRouter()
  const isDark = useColorScheme() === 'dark'
  const [rows, setRows] = React.useState<CupRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)

  const load = React.useCallback(async () => {
    const competition = state.competition
    const opts = isMiniCompetition(competition)
      ? {mini_league_id: competition.id}
      : undefined
    const res = await api.list(opts)
    if (res?.status === 'ok') {
      setRows(Array.isArray(res.data) ? res.data : [])
    }
  }, [state.competition])

  React.useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))
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
              {item.game_type_label ? ` · ${item.game_type_label}` : ''}
              {item.entry_count != null ? ` · ${item.entry_count} entries` : ''}
            </Text>
          </Pressable>
        )}
      />
    </View>
  )
}
