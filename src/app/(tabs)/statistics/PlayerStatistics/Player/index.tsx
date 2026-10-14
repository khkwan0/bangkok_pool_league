import PlayerStatistics from '@/components/PlayerStatistics'
import StatShortcuts from '@/components/Statistics/StatShortcuts'
import {useLeague} from '@/hooks/useLeague'
import {useLocalSearchParams, useNavigation} from 'expo-router'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {ActivityIndicator, View} from 'react-native'

interface PlayerInfo {
  player_id: number
  name?: string
  firstname?: string
  lastname?: string
  nationality?: {en: string}
  flag?: string
  profile_picture?: string
  gender?: string
  pic?: string | null
}

export default function PlayerStats() {
  const {params} = useLocalSearchParams()
  const {playerId} = JSON.parse(params as string)
  const league = useLeague()
  const [playerInfo, setPlayerInfo] = React.useState<PlayerInfo | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const navigation = useNavigation()
  const {t} = useTranslation()

  React.useEffect(() => {
    navigation.setOptions({
      title: playerInfo?.name || t('player_statistics'),
      headerBackTitle: t('back'),
      headerBackVisible: true,
    })
  }, [navigation, playerInfo, t])

  async function getPlayerInfo(playerId: number) {
    try {
      setIsLoading(true)
      const info = await league.GetPlayerStatsInfo(playerId)
      setPlayerInfo(info)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    if (playerId) {
      getPlayerInfo(playerId)
    }
  }, [playerId])

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  } else if (playerInfo) {
    return (
      <View className="flex-1">
        <StatShortcuts variant="compact" />
        <PlayerStatistics
          playerInfo={playerInfo}
          path="/statistics/PlayerStatistics"
        />
      </View>
    )
  }
}
