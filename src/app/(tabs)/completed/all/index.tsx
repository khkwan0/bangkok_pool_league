import CompletedMatchesOther from '@/components/Completed/CompletedMatchesOther'
import {useLocalSearchParams} from 'expo-router'

export default function CompletedAll() {
  const params = useLocalSearchParams()
  return <CompletedMatchesOther from={params.from} />
}
