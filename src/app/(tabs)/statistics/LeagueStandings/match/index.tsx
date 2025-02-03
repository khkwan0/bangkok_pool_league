import {useLocalSearchParams} from 'expo-router'
import Match from '@/components/Completed/Match'

export default function MatchScreen() {
  const {params} = useLocalSearchParams()
  const match = JSON.parse(params as string)
  return <Match match={match} />
}
