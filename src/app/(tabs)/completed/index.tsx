import CompletedMatch from '@/components/Completed/CompletedMatch'
import CompletedMatchesOther from '@/components/Completed/CompletedMatchesOther'
import {useStatColors} from '@/components/PlayerStatistics/statUi'
import {MiniLeagueCompleted} from '@/components/mini-leagues/MiniLeagueCompleted'
import {useLeagueContext} from '@/context/LeagueContext'
import {useTabListContentContainerStyle} from '@/hooks/useTabListContentContainerStyle'
import {useLeague} from '@/hooks/useLeague'
import {Colors} from '@/constants/Colors'
import {isMiniCompetition} from '@/types/competition'
import {Ionicons} from '@expo/vector-icons'
import {usePathname, useRouter} from 'expo-router'
import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {FlatList, Pressable, Text, useColorScheme, View} from 'react-native'

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
  return <CompletedMatchesOther />
}

function ShowAllMatches() {
  const router = useRouter()
  const pathname = usePathname()
  const {t} = useTranslation()
  const colors = useStatColors()
  return (
    <View style={{paddingHorizontal: 16, paddingBottom: 20}}>
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({pathname: '/completed/all', params: {from: pathname}})
      }
      style={({pressed}) => ({
        opacity: pressed ? 0.75 : 1,
      })}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}>
        <Ionicons name="list-outline" size={18} color={colors.accent} />
        <Text style={{flex: 1, fontSize: 15, fontWeight: '600', color: colors.text}}>
          {t('show_all_matches')}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.muted} />
      </View>
    </Pressable>
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
  const listContentStyle = useTabListContentContainerStyle()
  const pageBg = Colors[useColorScheme() === 'dark' ? 'dark' : 'light'].background

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
    if (isMiniCompetition(state.competition)) return
    getCompletedMatches(user.teams || [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.teams, state.competition])

  if (isMiniCompetition(state.competition)) {
    return <MiniLeagueCompleted miniLeagueId={state.competition.id} />
  }

  return (
    <View className="flex-1" style={{backgroundColor: pageBg}}>
      <FlatList
        style={{backgroundColor: pageBg}}
        data={matches}
        keyExtractor={item => item.match_id.toString()}
        renderItem={({item, index}) => (
          <CompletedMatch item={item} index={index} />
        )}
        refreshing={refreshing}
        onRefresh={() => getCompletedMatches(user.teams || [])}
        contentContainerClassName="py-4"
        contentContainerStyle={listContentStyle}
        ListHeaderComponent={matches.length > 0 ? <ShowAllMatches /> : null}
        ListEmptyComponent={isMounted ? <NoMatches /> : null}
        ListFooterComponent={<View className="h-4" />}
      />
    </View>
  )
}
