import React, {useCallback} from 'react'
import {FlatList} from 'react-native'
import {useLeagueContext} from '@/context/LeagueContext'
import {useLeague} from '@/hooks'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import CompletedMatch from '@/components/Completed/CompletedMatch'
import {useTranslation} from 'react-i18next'
import {useRouter, usePathname} from 'expo-router'
import Button from '@/components/Button'
import {MaterialIcons} from '@expo/vector-icons'

type CompletedMatchType = {
  match_id: number
  date: string
  original_date: string
  home_team_name: string
  away_team_name: string
  home_frames: number
  away_frames: number
}

type ApiResponse = {
  data: CompletedMatchType[]
}

export default function CompletedHome() {
  const {state} = useLeagueContext()
  const league = useLeague()
  const {t} = useTranslation()
  const user = state.user
  const pathname = usePathname()
  const [matches, setMatches] = React.useState<CompletedMatchType[]>([])
  const [refreshing, setRefreshing] = React.useState(false)
  const router = useRouter()

  const getCompletedMatches = useCallback(
    async (teams: {id: number}[]) => {
      try {
        setRefreshing(true)
        const res = (await league.GetCompletedMatchesByTeamId(
          teams,
        )) as ApiResponse
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.teams])

  if (matches.length === 0) {
    return (
      <View flex={1} className="px-4 justify-center items-center">
        <View className="bg-white p-6 rounded-2xl shadow-sm w-full max-w-[300px] items-center">
          <MaterialIcons
            name="event-available"
            size={48}
            color="#6b7280"
            className="mb-4"
          />
          <Text className="text-lg text-gray-500 text-center mb-6">
            {t('no_completed_matches')}
          </Text>
          <Button
            onPress={() =>
              router.push({pathname: '/Auth', params: {from: pathname}})
            }>
            {t('login_to_see_your_matches')}
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={matches}
        keyExtractor={item => item.match_id.toString()}
        renderItem={({item}) => (
          <View className="bg-white mx-4 mb-4 rounded-xl shadow-sm overflow-hidden">
            <CompletedMatch item={item} />
          </View>
        )}
        refreshing={refreshing}
        onRefresh={() => getCompletedMatches(user.teams || [])}
        contentContainerClassName="py-4"
        ListFooterComponent={<View className="h-4" />}
      />
    </View>
  )
}
