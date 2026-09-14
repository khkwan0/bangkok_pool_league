import CompletedMatch from '@/components/Completed/CompletedMatch'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {
  MiniSeasonChips,
  useMiniSeasonSelection,
} from '@/components/mini-leagues/MiniSeasonChips'
import {useMiniLeagues} from '@/hooks/useMiniLeagues'
import {useTabListContentContainerStyle} from '@/hooks/useTabListContentContainerStyle'
import React from 'react'
import {ActivityIndicator, FlatList} from 'react-native'

type CompletedMatchType = {
  match_id: number
  date: string
  original_date: string
  home_team_name: string
  away_team_name: string
  home_frames: number
  away_frames: number
}

export function MiniLeagueCompleted({miniLeagueId}: {miniLeagueId: number}) {
  const api = useMiniLeagues()
  const [matches, setMatches] = React.useState<CompletedMatchType[]>([])
  const [refreshing, setRefreshing] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const listContentStyle = useTabListContentContainerStyle()
  const {seasons, seasonId, setSeasonId} = useMiniSeasonSelection(miniLeagueId)

  const load = React.useCallback(async () => {
    setRefreshing(true)
    try {
      const opts =
        seasonId != null && Number(seasonId) > 0
          ? {season_id: Number(seasonId)}
          : undefined
      const res = await api.listMatches(miniLeagueId, opts)
      if (res?.status === 'ok') {
        const completed = (res.data || [])
          .filter((m: any) => Number(m.status_id) === 3)
          .map(
            (m: any): CompletedMatchType => ({
              match_id: m.id,
              date: m.date,
              original_date: m.original_date || '',
              home_team_name: m.home_team_name || 'Home',
              away_team_name: m.away_team_name || 'Away',
              home_frames: Number(m.home_frames) || 0,
              away_frames: Number(m.away_frames) || 0,
            }),
          )
        setMatches(completed)
      }
    } finally {
      setRefreshing(false)
      setIsMounted(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [miniLeagueId, seasonId])

  React.useEffect(() => {
    load()
  }, [load])

  return (
    <View className="flex-1">
      {!isMounted ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={item => item.match_id.toString()}
          ListHeaderComponent={
            <View className="px-4 pt-2">
              <MiniSeasonChips
                seasons={seasons}
                seasonId={seasonId}
                onSelect={setSeasonId}
              />
            </View>
          }
          renderItem={({item}) => (
            <View className="bg-white mx-4 mb-4 rounded-xl shadow-sm overflow-hidden">
              <CompletedMatch item={item} />
            </View>
          )}
          refreshing={refreshing}
          onRefresh={load}
          contentContainerClassName="py-4"
          contentContainerStyle={listContentStyle}
          ListEmptyComponent={
            <Text className="text-center opacity-60 mt-10 px-4">
              No completed matches yet.
            </Text>
          }
          ListFooterComponent={<View className="h-4" />}
        />
      )}
    </View>
  )
}
