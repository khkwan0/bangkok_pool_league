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

export default function StatisticsHome(props: any) {
  const league = useLeague()
  const [playerInfo, setPlayerInfo] = React.useState<PlayerInfo | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const {t} = useTranslation()
  const {state} = useLeagueContext()
  const user = state.user

  React.useEffect(() => {
    async function fetchPlayerInfo(user) {
      try {
        setIsLoading(true)
        const info = await league.GetPlayerStatsInfo(user.id)
        setPlayerInfo(info)
      } catch (e) {
        setError('Failed to load player information')
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    if (user) {
      fetchPlayerInfo(user)
    }
  }, [user])

  console.log('playerInfo', playerInfo)

  return (
    <View className="p-4 justify-center items-center flex-1">
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : playerInfo ? (
        <PlayerStatistics
          playerInfo={playerInfo}
          path="/statistics/PlayerStatistics"
        />
      ) : null}
      <View className="my-4">
        <Button
          icon={<Ionicons name="trophy" size={24} color="#FFD700" />}
          onPress={() => router.push('/statistics/LeagueStandings')}>
          {t('league_standings')}
        </Button>
      </View>
      <View className="my-4">
        <Button
          icon={<Ionicons name="people" size={24} color="#4CAF50" />}
          onPress={() => router.push('/statistics/TeamStatistics')}>
          {t('team_statistics')}
        </Button>
      </View>
      <View className="my-4">
        <Button
          icon={<Ionicons name="person" size={24} color="#2196F3" />}
          onPress={() => router.push('/statistics/PlayerStatistics')}>
          {t('player_statistics')}
        </Button>
      </View>
    </View>
  )
}