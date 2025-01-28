import {useLocalSearchParams} from 'expo-router'
import PlayerStatistics from '@/components/PlayerStatistics'

export default function PlayerStats() {
  const {params} = useLocalSearchParams()
  const playerInfo = JSON.parse(params as string).playerInfo

  return <PlayerStatistics playerInfo={playerInfo} />
}
