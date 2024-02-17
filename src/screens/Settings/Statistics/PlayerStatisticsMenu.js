import React from 'react'
import {Pressable, Row, Text, View} from '@ybase'

const PlayerStatisticsMenu = props => {
  return (
    <View flex={1} px={20}>
      <Pressable
        flex={1}
        alignItems="center"
        justifyContent="center"
        onPress={() => props.navigation.navigate('Player Statistics')}>
        <Text>All Stats</Text>
      </Pressable>
      <Pressable
        flex={1}
        alignItems="center"
        justifyContent="center"
        onPress={() =>
          props.navigation.navigate('Player Statistics', {gameType: '9b'})
        }>
        <Text>Nine Ball</Text>
      </Pressable>
      <Pressable
        flex={1}
        alignItems="center"
        justifyContent="center"
        onPress={() =>
          props.navigation.navigate('Player Statistics', {gameType: '8b'})
        }>
        <Text>Eight Ball</Text>
      </Pressable>
    </View>
  )
}

export default PlayerStatisticsMenu
