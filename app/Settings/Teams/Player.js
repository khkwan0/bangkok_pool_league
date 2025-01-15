import React from 'react'
import Player from '@/app/Settings/Player'

// could've just imported directly from previous screen,
// but by doing this, it's just easier to see that the common
// screen "Player" is part of this stack as well as others
const _Player = props => {
  const playerId = props.route.params.playerId
  return <Player playerId={playerId} />
}

export default _Player
