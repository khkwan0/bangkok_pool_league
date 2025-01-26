import React from 'react'
import MatchScreen from '@/app/Settings/MatchScreen'

const PlayerMatchScreen = props => {
  const matchId = props.route.params.matchId
  return <MatchScreen matchId={matchId} />
}

export default PlayerMatchScreen
