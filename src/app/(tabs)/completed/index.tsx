import React, {useCallback} from 'react'
import {FlatList, View} from 'react-native'
import {useLeagueContext} from '@/context/LeagueContext'
import {useLeague} from '@/hooks/useLeague'
import CompletedMatch from '@/components/Completed/CompletedMatch'
import {useTranslation} from 'react-i18next'
import {useRouter, usePathname} from 'expo-router'
import Button from '@/components/Button'
import CompletedMatchesOther from '@/components/Completed/CompletedMatchesOther'

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

function NoMatches() {
  const {t} = useTranslation()
  const {state} = useLeagueContext()
  const user = state.user
  const router = useRouter()
  const pathname = usePathname()

  return (
    <View className="px-4">
      {!user.id && (
        <Button
          onPress={() =>
            router.push({pathname: '/Auth', params: {from: pathname}})
          }>
          {t('login_to_see_your_matches')}
        </Button>
      )}
      <CompletedMatchesOther />
    </View>
  )
}

function ShowAllMatches() {
  const router = useRouter()
  const pathname = usePathname()
  const {t} = useTranslation()
  return (
    <View className="px-4 mb-4">
      <Button
        onPress={() =>
          router.push({pathname: '/completed/all', params: {from: pathname}})
        }>
        {t('show_all_matches')}
      </Button>
    </View>
  )
}

export default function CompletedHome() {
  const {state} = useLeagueContext()
  const league = useLeague()
  const user = state.user
  const [matches, setMatches] = React.useState<CompletedMatchType[]>([])
  const [refreshing, setRefreshing] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)

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
        setIsMounted(true)
      }
    },
    [league],
  )

  React.useEffect(() => {
    getCompletedMatches(user.teams || [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.teams])

  return (
    <View className="flex-1">
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
        ListHeaderComponent={matches.length > 0 ? <ShowAllMatches /> : null}
        ListEmptyComponent={isMounted ? <NoMatches /> : null}
        ListFooterComponent={<View className="h-4" />}
      />
    </View>
  )
}
