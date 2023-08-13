import React from 'react'
import {View} from 'react-native'
import {Button, Text} from 'react-native-paper'

const PlayerCard = (props: any) => {
  function HandleSelect(playerId: number) {
    props.handleSelect(playerId)
  }

  return (
    <View
      style={[
        {flexDirection: 'row', alignItems: 'center', padding: 10},
        props.idx % 2 !== 0 ? {backgroundColor: '#0000ff22'} : {},
      ]}>
      <View style={{flex: 1.5}}>
        <Text variant="bodyLarge">{props.player.nickname}</Text>
        <View style={{flexDirection: 'row'}}>
          {props.player.firstname && (
            <Text variant="bodyLarge">{props.player.firstname}</Text>
          )}
          {props.player.lastname && (
            <Text variant="bodyLarge">
              &nbsp;
              {props.abbrevLast
                ? props.player.lastname.substr(
                    0,
                    props.player.lastname.length > 2 ? 3 : 2,
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
          onPress={() => HandleSelect(props.player.playerId)}>
          Select
        </Button>
      </View>
    </View>
  )
}

export default PlayerCard
