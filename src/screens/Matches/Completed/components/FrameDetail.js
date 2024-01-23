import React from 'react'
import {Pressable, Row, Text, View} from '@ybase'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useSelector} from 'react-redux'
import {useYBase} from '~/lib/hooks'

const FrameDetails = props => {
  const {homePlayers, awayPlayers, homeWin} = props.item.item
  const user = useSelector(_state => _state.userData).user
  const {colors} = useYBase()

  const isAdmin = user.role_id === 9 ? true : false
  return (
    <View my={10} px={20} key={'complete_frame_detail' + props.idx}>
      <Row alignItems="center">
        <View flex={1}>
          {homePlayers.map((player, idx) => (
            <View key={'home_compelted' + idx}>
              {idx !== 0 && <Text>and</Text>}
              <Text bold>{player.nickName}</Text>
            </View>
          ))}
        </View>
        <View flex={1} justifyContent="center" alignItems="center">
          {homeWin === 1 && <MCI name="check" size={30} color="green" />}
          {homeWin === 0 && isAdmin && (
            <Pressable>
              <MCI name="close-circle-outline" color={colors.error} size={20} />
            </Pressable>
          )}
        </View>
        <View flex={0.3} alignItems="center">
          <Text>vs</Text>
        </View>
        <View flex={1} justifyContent="center" alignItems="center">
          {homeWin === 0 && <MCI name="check" size={30} color="green" />}
          {homeWin === 1 && isAdmin && (
            <Pressable>
              <MCI name="close-circle-outline" color={colors.error} size={20} />
            </Pressable>
          )}
        </View>
        <View flex={1} alignItems="flex-end">
          {awayPlayers.map((player, idx) => (
            <View key={'away_completed' + idx}>
              {idx !== 0 && <Text>and</Text>}
              <Text bold>{player.nickName}</Text>
            </View>
          ))}
        </View>
      </Row>
    </View>
  )
}

export default FrameDetails
