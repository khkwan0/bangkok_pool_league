import React from 'react'
import {View} from 'react-native'
import {Text} from 'react-native-paper'

const Stats = ({stats}) => {
  return (
    <>
      {Object.keys(stats).map((gameType, index) => {
        const margin = gameType === 'Total' ? 10 : 0
        const fw = gameType === 'Total' ? 'bold' : 'normal'
        return (
          <View
            key={gameType + '_' + index}
            style={{flexDirection: 'row', marginVertical: margin}}>
            <View style={{flex: 2}}>
              <Text style={{fontWeight: fw}}>{gameType}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontWeight: fw}}>{stats[gameType].played}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontWeight: fw}}>{stats[gameType].won}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontWeight: fw}}>{stats[gameType].winp}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontWeight: fw}}>{stats[gameType].wgtd}</Text>
            </View>
          </View>
        )
      })}
    </>
  )
}

export default Stats
