import React, {useCallback} from 'react'
import {FlatList} from 'react-native'
import {useLeagueContext} from '@/context/LeagueContext'
import {useLeague} from '@/hooks'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import CompletedMatch from '@/components/Completed/CompletedMatch'
import {useTranslation} from 'react-i18next'

type CompletedMatchType = {
  match_id: number
  date: string
  original_date: string
  home_team_name: string
  away_team_name: string
  home_frames: number
  away_frames: number
}

export default function CompletedHome() {
  const {state} = useLeagueContext()
  const league = useLeague()
  const {t} = useTranslation()
  const user = state.user
  const [matches, setMatches] = React.useState<CompletedMatchType[]>([])
  const [refreshing, setRefreshing] = React.useState(false)

  const getCompletedMatches = useCallback(
    async (teams: {id: number}[]) => {
      try {
        setRefreshing(true)
        const res = await league.GetCompletedMatchesByTeamId(teams)
        setMatches(res.data)
      } catch (error) {
        console.error('Failed to fetch matches:', error)
      } finally {
        setRefreshing(false)
      }
    },
    [league],
  )

  React.useEffect(() => {
    getCompletedMatches(user.teams || [])
  }, [user.teams])

  if (matches.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-lg text-gray-500 text-center">
          {t('no_completed_matches')}
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-slate-50">
      <FlatList
        data={matches}
        keyExtractor={item => item.match_id.toString()}
        renderItem={({item}) => <CompletedMatch item={item} />}
        refreshing={refreshing}
        onRefresh={() => getCompletedMatches(user.teams || [])}
        contentContainerClassName="p-4 pb-8"
        ItemSeparatorComponent={() => <View className="h-4" />}
      />
    </View>
  )
}
