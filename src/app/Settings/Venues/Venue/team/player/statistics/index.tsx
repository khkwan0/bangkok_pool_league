import {useLocalSearchParams} from 'expo-router'
import PlayerStatistics from '@/components/PlayerStatistics'
import {useNavigation} from '@react-navigation/native'
import React from 'react'

export default function PlayerStats() {
  const {params} = useLocalSearchParams()
  const playerInfo = JSON.parse(params as string).playerInfo
  const navigation = useNavigation()

  React.useEffect(() => {
    navigation.setOptions({
      title: playerInfo.name,
    })
  }, [playerInfo])

  return <PlayerStatistics playerInfo={playerInfo} path="./statistics/match" />
}
