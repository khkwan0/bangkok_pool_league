import {useLocalSearchParams} from 'expo-router'
import PlayerDetails from '@/components/PlayerDetails'

export default function Player() {
  const {params} = useLocalSearchParams()
  const playerId = JSON.parse(params as string).playerId

  return <PlayerDetails playerId={playerId} />
}
