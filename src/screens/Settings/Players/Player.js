import React from 'react'
import Player from '@screens/Settings/Player'

// could've just imported directly from previous screen,
// but by doing this, it's just easier to see that the common
// screen "Player" is part of this stack as well as others
const _Player = props => {
  const playerInfo = props?.route?.params?.playerInfo ?? null
  return <Player playerId={playerInfo.id} />
}

export default _Player
