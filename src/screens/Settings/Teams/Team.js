import React from 'react'
import Team from '@screens/Settings/Team'

const _Team = props => {
  const team = props.route.params.team
  return <Team team={team} />
}

export default _Team
