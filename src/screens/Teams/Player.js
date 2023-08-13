import React from 'react'
import Player from '@screens/Player'
import {useLeague} from '~/lib/hooks'
import {View} from 'react-native'
import {ActivityIndicator} from 'react-native-paper'

// could've just imported directly from previous screen,
// but by doing this, it's just easier to see that the common
// screen "Player" is part of this stack as well as others
const _Player = props => {
  const league = useLeague()
  const playerId = props.route.params.playerId
  const [playerInfo, setPlayerInfo] = React.useState(null)

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await league.GetPlayerStatsInfo(playerId)
        setPlayerInfo(res)
      } catch (e) {
        console.log(e)
      }
    })()
  }, [playerId])

  if (playerInfo) {
    return <Player playerInfo={playerInfo} />
  } else {
    return (
      <View>
        <ActivityIndicator />
      </View>
    )
  }
}

export default _Player
