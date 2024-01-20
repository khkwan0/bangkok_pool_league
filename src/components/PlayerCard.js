import React from 'react'
import {useTranslation} from 'react-i18next'
import {View} from 'react-native'
import {Button, Text} from 'react-native-paper'

const PlayerCard = props => {
  const {t} = useTranslation()

  function HandleSelect(playerId) {
    let newToTeam = false
    if (typeof props.newToTeam !== 'undefined' && props.newToTeam) {
      newToTeam = true
    }
    props.handleSelect(playerId, false, newToTeam)
  }

  return (
    <View
      style={[
        {flexDirection: 'row', alignItems: 'center', padding: 10},
        props.idx % 2 !== 0
          ? {backgroundColor: '#0000ff22'}
          : {backgroundColor: '#0011aa22'},
      ]}>
      <View style={{flex: 1.5}}>
        <Text variant="bodyLarge">
          {t('nickname')}: {props.player.name ?? props.player.nickname}
        </Text>
        <View style={{flexDirection: 'row'}}>
          {(props.player.firstname || props.player.firstName) && (
            <Text variant="bodyLarge">
              &nbsp;
              {props.abbrevFirst
                ? (props.player.firstname ?? props.player.firstName).substr(
                    0,
                    (props.player.firstname ?? props.player.firstName).length >
                      2
                      ? 3
                      : 2,
                  )
                : props.player.firstname}
            </Text>
          )}
          {(props.player.lastname || props.player.lastName) && (
            <Text variant="bodyLarge">
              &nbsp;
              {props.abbrevLast
                ? (props.player.lastname ?? props.player.lastName).substr(
                    0,
                    (props.player.lastname ?? props.player.lastName).length > 2
                      ? 3
                      : 2,
                  )
                : props.player.lastname}
            </Text>
          )}
        </View>
      </View>
      <View style={{flex: 1}}>
        <Button
          disabled={props.disabled}
          mode="outlined"
          onPress={() =>
            HandleSelect(props.player.playerId ?? props.player.player_id)
          }>
          Select
        </Button>
      </View>
    </View>
  )
}

export default PlayerCard
