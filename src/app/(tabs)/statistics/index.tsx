/* eslint-disable react-hooks/exhaustive-deps */
import {ThemedView as View} from '@/components/ThemedView'
import {router} from 'expo-router'
import {Ionicons} from '@expo/vector-icons'
import Button from '@/components/Button'
import {useTranslation} from 'react-i18next'
import React from 'react'
import {useLeagueContext} from '@/context/LeagueContext'
import PlayerStatistics from '@/components/PlayerStatistics'
import {useLeague} from '@/hooks/useLeague'
import {ActivityIndicator} from 'react-native'
import type {PlayerInfo} from '@/types/player'
import {useTheme} from '@react-navigation/native'

export default function StatisticsHome(props: any) {
  const league = useLeague()
  const [playerInfo, setPlayerInfo] = React.useState<PlayerInfo | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const {t} = useTranslation()
  const {state} = useLeagueContext()
  const user = state.user
  const {colors} = useTheme()

  React.useEffect(() => {
    async function fetchPlayerInfo(user) {
      try {
        setIsLoading(true)
        const info = await league.GetPlayerStatsInfo(user.id)
        setPlayerInfo(info)
      } catch (e) {
        setError(t('failed_to_load_player_info'))
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    if (user) {
      fetchPlayerInfo(user)
    }
  }, [user])

  if (typeof user.id === 'undefined' || user.id === null || !playerInfo) {
    return (
      <View className="flex-1 justify-center items-center">
        <View className="my-4">
          <Button
            onPress={() => router.push('/statistics/LeagueStandings')}
            icon={<Ionicons name="trophy" size={18} color="#FFD700" />}>
            {t('league_standings')}
          </Button>
        </View>
        <View className="my-4">
          <Button
            onPress={() => router.push('/statistics/TeamStatistics')}
            icon={<Ionicons name="people" size={18} color="#4CAF50" />}>
            {t('team_statistics')}
          </Button>
        </View>
        <View className="my-4">
          <Button
            onPress={() => router.push('/statistics/PlayerStatistics')}
            icon={<Ionicons name="person" size={18} color="#2196F3" />}>
            {t('player_statistics')}
          </Button>
        </View>
        <View className="my-4">
          <Button
            onPress={() => router.push('/statistics/PlayerRankings')}
            icon={<Ionicons name="list" size={18} color="#9C27B0" />}>
            {t('player_rankings')}
          </Button>
        </View>
      </View>
    )
  }
  return (
    <View className="flex-1" style={{backgroundColor: colors.background}}>
      {/* Navigation buttons in a horizontal row */}
      <View className="flex-row justify-around items-center p-2 bg-gray-100 dark:bg-gray-700">
        <Button
          small
          icon={<Ionicons name="trophy" size={18} color="#FFD700" />}
          onPress={() => router.push('/statistics/LeagueStandings')}>
          {t('league_standings_short')}
        </Button>
        <Button
          small
          icon={<Ionicons name="people" size={18} color="#4CAF50" />}
          onPress={() => router.push('/statistics/TeamStatistics')}>
          {t('team_statistics_short')}
        </Button>
        <Button
          small
          icon={<Ionicons name="person" size={18} color="#2196F3" />}
          onPress={() => router.push('/statistics/PlayerStatistics')}>
          {t('player_statistics_short')}
        </Button>
        <Button
          small
          icon={<Ionicons name="podium" size={18} color="#9C27B0" />}
          onPress={() => router.push('/statistics/PlayerRankings')}>
          {t('player_rankings_short')}
        </Button>
      </View>

      {/* Player statistics content area */}
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" />
          </View>
        ) : typeof user.id !== 'undefined' && user.id && playerInfo ? (
          <PlayerStatistics playerInfo={playerInfo} path="/statistics" />
        ) : null}
      </View>
    </View>
  )
}
