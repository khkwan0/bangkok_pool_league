import React from 'react'
import {Button} from 'react-native-paper'
import {ActivityIndicator, Pressable, Row, Text, View} from '@ybase'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import {useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'

const Frame = props => {
  const {colors} = useYBase()
  const disabled = props.finalizedHome && props.finalizedAway
  const {t} = useTranslation()

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

    function HandleChoosePlayer(side, number) {
      if (props.isLoading || disabled || props.side !== side || !props.side) {
      } else {
        const teamId =
          side === 'home'
            ? props.matchInfo.home_team_id
            : props.matchInfo.away_team_id
        props.choosePlayer(
          teamId,
          number,
          props.frameIdx,
          props.frame.section,
          props.frame.mfpp,
        )
      }
    }

    function HandleChooseFrameWin(side, teamId, playerIds) {
      if (
        !props.side ||
        disabled ||
        props.isLoading ||
        (props.gameType === 'doubles'
          ? homePlayerA && homePlayerB && awayPlayerA && awayPlayerB
            ? false
            : true
          : homePlayerA && awayPlayerA
          ? false
          : true)
      ) {
      } else {
        props.setWinner(
          side,
          teamId,
          playerIds,
          props.frameIdx,
          props.frame.type,
          props.frame.frameNumber,
        )
      }
    }

    return (
      <View
        bgColor={
          props.frameIdx % 2 === 1
            ? colors.frameBackground
            : colors.altFrameBackground
        }
        pb={10}>
        <Text style={{textAlign: 'center'}}>
          {t('frame')} {props.frame.frameNumber}
        </Text>
        <Row px={10}>
          <View
            style={{
              flex: 2,
              paddingVertical: 10,
              backgroundColor: '#fca9a9',
              borderRadius: 5,
            }}>
            <Button
              icon={!homePlayerA ? 'plus-circle' : ''}
              onPress={() => HandleChoosePlayer('home', 0)}>
              {homePlayerA ? homePlayerA : 'Player'}
            </Button>
            {props.gameTypes[props.frame.type].no_players === 2 && (
              <View style={{marginTop: 5}}>
                <Button
                  icon={!homePlayerB ? 'plus-circle' : ''}
                  onPress={() => HandleChoosePlayer('home', 1)}>
                  {homePlayerB ? homePlayerB : 'Player'}
                </Button>
              </View>
            )}
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              {props.firstBreak === props.matchInfo.home_team_id &&
                props.frameIdx % 2 === 0 && <Text>{t('break')}</Text>}
              {props.firstBreak === props.matchInfo.away_team_id &&
                props.frameIdx % 2 === 1 && <Text>{t('break')}</Text>}
            </View>
          </View>
          <View flex={1} alignItems="center" justifyContent="center" py={10}>
            {props.frame.winner === props.matchInfo.home_team_id && (
              <MaterialCommunityIcons name="check" color="green" size={30} />
            )}
            {props.frame.winner !== props.matchInfo.home_team_id && (
              <Pressable
                onPress={() =>
                  HandleChooseFrameWin(
                    'home',
                    props.matchInfo.home_team_id,
                    props.frame.homePlayerIds,
                  )
                }>
                {props.frame.winner !== props.matchInfo.home_team_id &&
                  props.frame.winner !== 0 && (
                    <MaterialCommunityIcons
                      name="close-circle-outline"
                      color="red"
                      size={30}
                    />
                  )}
                {props.frame.winner === 0 && <Text>win</Text>}
              </Pressable>
            )}
          </View>
          <View
            flex={1}
            alignItems="center"
            justifyContent="center"
            borderLeftWidth={1}
            py={10}>
            {props.frame.winner === props.matchInfo.away_team_id && (
              <MaterialCommunityIcons name="check" color="green" size={30} />
            )}
            {props.frame.winner !== props.matchInfo.away_team_id && (
              <Pressable
                onPress={() =>
                  HandleChooseFrameWin(
                    'away',
                    props.matchInfo.away_team_id,
                    props.frame.awayPlayerIds,
                  )
                }>
                {props.frame.winner !== props.matchInfo.away_team_id &&
                  props.frame.winner !== 0 && (
                    <MaterialCommunityIcons
                      name="close-circle-outline"
                      color="red"
                      size={30}
                    />
                  )}
                {props.frame.winner === 0 && <Text>win</Text>}
              </Pressable>
            )}
          </View>
          <View
            style={{
              flex: 2,
              paddingVertical: 10,
              backgroundColor: '#b8bbf5',
              borderRadius: 5,
            }}>
            <Button
              icon={!awayPlayerA ? 'plus-circle' : ''}
              onPress={() => HandleChoosePlayer('away', 0)}>
              {awayPlayerA ? (
                awayPlayerA
              ) : awayPlayerA === null ? (
                <ActivityIndicator color="#f00" />
              ) : (
                'Player'
              )}
            </Button>
            {props.gameTypes[props.frame.type].no_players === 2 && (
              <View style={{marginTop: 5}}>
                <Button
                  disabled={
                    props.isLoading || disabled || props.side === 'home'
                  }
                  icon={!awayPlayerB ? 'plus-circle' : ''}
                  onPress={() => HandleChoosePlayer('away', 1)}>
                  {awayPlayerB ? awayPlayerB : 'Player'}
                </Button>
              </View>
            )}
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              {props.firstBreak === props.matchInfo.away_team_id &&
                props.frameIdx % 2 === 0 && <Text>{t('break')}</Text>}
              {props.firstBreak === props.matchInfo.home_team_id &&
                props.frameIdx % 2 === 1 && <Text>{t('break')}</Text>}
            </View>
          </View>
        </Row>
      </View>
    )
  } else {
    return (
      <View style={{flexDirection: 'row', paddingHorizontal: 10}}>
        <View style={{flex: 2}}>
          <Text>
            {t('section')} {props.frame.section}
          </Text>
        </View>
        <View style={{flex: 1}}>
          <Text variant="displaySmall" style={{textAlign: 'center'}}>
            {props.frame.homeScore}
          </Text>
        </View>
        <View style={{flex: 1}}>
          <Text variant="displaySmall" style={{textAlign: 'center'}}>
            {props.frame.awayScore}
          </Text>
        </View>
        <View style={{flex: 2}} />
      </View>
    )
  }
}

export default Frame
