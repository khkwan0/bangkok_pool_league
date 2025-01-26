import React from 'react'
import Team from '@/app/Settings/Team'
import {useLocalSearchParams} from 'expo-router'

const _Team = () => {
  const team = useLocalSearchParams()
  return <Team team={team} />
}

export default _Team
