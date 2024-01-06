import React from 'react'
import {Button, Row, Text, View} from '@ybase'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'

const FrameDetails = props => {
  const {homePlayers, awayPlayers, homeWin} = props.item.item
  return (
    <View my={10} px={20}>
      <Row alignItems="center">
        <View flex={1}>
          {homePlayers.map((player, idx) => (
            <>
              {idx !== 0 && <Text>and</Text>}
              <Text bold>{player.nickName}</Text>
            </>
          ))}
        </View>
        <View flex={1} justifyContent="center" alignItems="center">
          {homeWin === 1 && <MCI name="check" size={30} color="green" />}
          {homeWin === 0 && <Button variant="ghost">Win</Button>}
        </View>
        <View flex={0.3} alignItems="center">
          <Text>vs</Text>
        </View>
        <View flex={1} justifyContent="center" alignItems="center">
          {homeWin === 0 && <MCI name="check" size={30} color="green" />}
          {homeWin === 1 && <Button variant="ghost">Win</Button>}
        </View>
        <View flex={1} alignItems="flex-end">
          {awayPlayers.map((player, idx) => (
            <>
              {idx !== 0 && <Text>and</Text>}
              <Text bold>{player.nickName}</Text>
            </>
          ))}
        </View>
      </Row>
    </View>
  )
}

export default FrameDetails
