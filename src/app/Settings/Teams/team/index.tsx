import TeamMembers from '@/components/Teams/Team'
import {useLocalSearchParams} from 'expo-router'
import {criticallyDampedSpringCalculations} from 'react-native-reanimated/lib/typescript/animation/springUtils'

export default function Team() {
  const {params} = useLocalSearchParams()
  const teamId = JSON.parse(params as string).teamId
  return <TeamMembers teamId={teamId} />
}
