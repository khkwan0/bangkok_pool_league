import React from 'react'
import MatchScreen from '@screens/MatchScreen'

const PlayerMatchScreen = props => {
  const matchId = props.route.params.matchId
  return <MatchScreen matchId={matchId} />
}

export default PlayerMatchScreen
