import React from 'react'
import {View} from 'react-native'
import {Text, TouchableRipple} from 'react-native-paper'

const StatsDoubles = props => {
  const stats = props.stats
  const fw = 'normal'
  const variant = 'bodyMedium'
  return (
    <>
      {stats.map((stat, index) => {
        const playerId = stat.playerId
        return (
          <View key={stat + '_' + index} style={{flexDirection: 'row'}}>
            <TouchableRipple
              onPress={() => props.playerSelect(playerId)}
              style={{flex: 3}}>
              <Text variant={variant} style={{fontWeight: fw}}>
                {stat.nickname}
              </Text>
            </TouchableRipple>
            <View style={{flex: 1}}>
              <Text variant={variant} style={{fontWeight: fw}}>
                {stat.played}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontWeight: fw}}>{stat.won}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text variant={variant} style={{fontWeight: fw}}>
                {stat.winp}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text variant={variant} style={{fontWeight: fw}}>
                {stat.wgtd}
              </Text>
            </View>
          </View>
        )
      })}
    </>
  )
}

export default StatsDoubles
