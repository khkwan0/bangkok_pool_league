import React from 'react'
import {Row, Text, View} from '@ybase'
import {ActivityIndicator} from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import {useYBase} from '~/lib/hooks'

const CompletedFrame = props => {
  const {colors} = useYBase()
  if (props.frame.type !== 'section') {
    let awayPlayerA = ''
    let awayPlayerB = ''
    if (props.frame.awayPlayerIds.length > 0) {
      let _player = props.teams[props.matchInfo.away_team_id].find(
        player => player.playerId === props.frame.awayPlayerIds[0],
      )
      awayPlayerA = _player?.nickname ?? null
      if (props.frame.awayPlayerIds.length > 1) {
        _player = props.teams[props.matchInfo.away_team_id].find(
          player => player.playerId === props.frame.awayPlayerIds[1],
        )
        awayPlayerB = _player?.nickname ?? null
      }
    }

    let homePlayerA = ''
    let homePlayerB = ''
    if (props.frame.homePlayerIds.length > 0) {
      let _player = props.teams[props.matchInfo.home_team_id].find(
        player => player.playerId === props.frame.homePlayerIds[0],
      )
      homePlayerA = _player?.nickname ?? null
      if (props.frame.homePlayerIds.length > 1) {
        _player = props.teams[props.matchInfo.home_team_id].find(
          player => player.playerId === props.frame.homePlayerIds[1],
        )
        homePlayerB = _player?.nickname ?? null
      }
    }

    return (
      <View
        bgColor={
          props.frame.frameNumber % 2 === 1
            ? colors.completedFrame
            : colors.completedFrameAlt
        }>
        <Text textAlign="center">Frame {props.frame.frameNumber}</Text>
        <Row px={10} alignItems="center">
          <View flex={1}>
            <Text>{homePlayerA ? homePlayerA : 'Player'}</Text>
            {props.gameTypes[props.frame.type].no_players === 2 && (
              <Text>/{homePlayerB ? homePlayerB : 'Player'}</Text>
            )}
            {props.firstBreak === props.matchInfo.home_team_id &&
              props.frame.frameNumber % 2 === 1 && <Text>*</Text>}
            {props.firstBreak === props.matchInfo.away_team_id &&
              props.frame.frameNumber % 2 === 0 && <Text>*</Text>}
          </View>
          <View flex={1} alignIems="center" justifyContent="center" py={10}>
            {props.frame.winner === props.matchInfo.home_team_id && (
              <MaterialCommunityIcons name="check" color="green" size={30} />
            )}
            {props.frame.winner === props.matchInfo.away_team_id && (
              <MaterialCommunityIcons
                name="close-circle-outline"
                color={colors.error}
                size={30}
              />
            )}
          </View>
          <View flex={1} />
          {props.frame.winner === props.matchInfo.away_team_id && (
            <MaterialCommunityIcons name="check" color="green" size={30} />
          )}
          {props.frame.winner === props.matchInfo.home_team_id && (
            <MaterialCommunityIcons
              name="close-circle-outline"
              color={colors.error}
              size={30}
            />
          )}
          <View flex={1} py={10}>
            <Text>
              {awayPlayerA ? (
                awayPlayerA
              ) : awayPlayerA === null ? (
                <ActivityIndicator color="#f00" />
              ) : (
                'Player'
              )}
            </Text>
            {props.gameTypes[props.frame.type].no_players === 2 && (
              <Text>/{awayPlayerB ? awayPlayerB : 'Player'}</Text>
            )}
            {props.firstBreak === props.matchInfo.away_team_id &&
              props.frame.frameNumber % 2 === 1 && <Text>*</Text>}
            {props.firstBreak === props.matchInfo.home_team_id &&
              props.frame.frameNumber % 2 === 0 && <Text>*</Text>}
          </View>
        </Row>
      </View>
    )
  } else {
    return null
  }
}

export default CompletedFrame
