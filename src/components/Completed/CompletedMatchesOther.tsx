/* eslint-disable react-hooks/exhaustive-deps */
import {View, FlatList, ActivityIndicator} from 'react-native'
import {useSeason} from '@/hooks/useSeason'
import React from 'react'
import {useLeagueContext} from '@/context/LeagueContext'
import MatchDateItem from './MatchDateItem'
import {useTranslation} from 'react-i18next'
import {ThemedText as Text} from '@/components/ThemedText'

type MatchDate = {
  date: string
  matches: {
    match_id: number
    match_status_id: number
    match_date: string
    home_team_name: string
    away_team_name: string
    home_frames: number
    away_frames: number
  }[]
}

export default function CompletedMatchesOther() {
  const {GetCompletedMatchesBySeason} = useSeason()
  const {state} = useLeagueContext()
  const season = state.season
  const [matchDates, setMatchDates] = React.useState<MatchDate[]>([])
  const {t} = useTranslation()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    const getCompletedMatches = async () => {
      try {
        const res = await GetCompletedMatchesBySeason(season)
        setMatchDates(res?.data ?? [])
      } catch (e) {
        console.log(e)
      } finally {
        setIsMounted(true)
      }
    }
    getCompletedMatches()
  }, [])

  if (!isMounted) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  return (
    <FlatList
      data={matchDates}
      renderItem={({item}) => <MatchDateItem date={item} />}
      keyExtractor={(item, index) => `${index.toString()}_${item.date}`}
      ItemSeparatorComponent={() => <View className="h-4" />}
      ListEmptyComponent={() => (
        <View className="p-4 items-center justify-center">
          <View className="p-2">
            <Text>{t('no_completed_matches')}</Text>
          </View>
        </View>
      )}
    />
  )
}
