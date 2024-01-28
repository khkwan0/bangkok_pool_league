import React from 'react'
import {TouchableRipple} from 'react-native-paper'
import {Row, Text, View} from '@ybase'

const StatsDoubles = props => {
  const stats = props.stats
  const fw = 'normal'
  return (
    <>
      {stats.map((stat, index) => {
        const playerId = stat.playerId
        return (
          <Row key={stat + '_' + index}>
            <TouchableRipple
              onPress={() => props.playerSelect(playerId)}
              style={{flex: 3}}>
              <Text style={{fontWeight: fw}}>{stat.nickname}</Text>
            </TouchableRipple>
            <View flex={1}>
              <Text style={{fontWeight: fw}}>{stat.played}</Text>
            </View>
            <View flex={1}>
              <Text style={{fontWeight: fw}}>{stat.won}</Text>
            </View>
            <View flex={1}>
              <Text style={{fontWeight: fw}}>{stat.winp}</Text>
            </View>
            <View flex={1}>
              <Text style={{fontWeight: fw}}>{stat.wgtd}</Text>
            </View>
          </Row>
        )
      })}
    </>
  )
}

export default StatsDoubles
