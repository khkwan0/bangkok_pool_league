import CompletedMatchDetails from '@/components/Completed/CompletedMatchDetails'
import {useLocalSearchParams} from 'expo-router'

export default function Match() {
  const {params} = useLocalSearchParams()
  const matchId = JSON.parse(params as string).matchId
  return <CompletedMatchDetails matchId={matchId} />
}
