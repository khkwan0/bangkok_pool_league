import React from 'react'
import {View} from 'react-native'
import {ActivityIndicator, Text} from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const CompletedFrame = props => {
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
        style={{
          backgroundColor: props.frame.frameNumber % 2 === 1 ? '#fff' : '#ccc',
        }}>
        <Text style={{textAlign: 'center'}}>
          Frame {props.frame.frameNumber}
        </Text>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            paddingHorizontal: 10,
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              flex: 2,
              paddingVertical: 10,
            }}>
            <Text>{homePlayerA ? homePlayerA : 'Player'}</Text>
            {props.gameTypes[props.frame.type].no_players === 2 && (
              <Text>/{homePlayerB ? homePlayerB : 'Player'}</Text>
            )}
            {props.firstBreak === props.matchInfo.home_team_id &&
              props.frameIdx % 2 === 0 && <Text>*</Text>}
            {props.firstBreak === props.matchInfo.away_team_id &&
              props.frameIdx % 2 === 1 && <Text>*</Text>}
          </View>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 10,
            }}>
            {props.frame.winner === props.matchInfo.home_team_id && (
              <MaterialCommunityIcons name="check" color="green" size={30} />
            )}
          </View>
          {props.frame.winner === props.matchInfo.away_team_id && (
            <MaterialCommunityIcons name="check" color="green" size={30} />
          )}
          <View
            style={{
              flex: 2,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingVertical: 10,
            }}>
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
              props.frameIdx % 2 === 0 && <Text>*</Text>}
            {props.firstBreak === props.matchInfo.home_team_id &&
              props.frameIdx % 2 === 1 && <Text>*</Text>}
          </View>
        </View>
      </View>
    )
  } else {
    return null
  }
}

export default CompletedFrame
