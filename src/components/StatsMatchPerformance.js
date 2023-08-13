import React from 'react'
import {View} from 'react-native'
import {Text, TouchableRipple} from 'react-native-paper'
import {DateTime} from 'luxon'
import {useNavigation} from '@react-navigation/native'

const StatsMatchPerformance = ({stats}) => {
  const navigation = useNavigation()
  return (
    <View>
      {stats.map((stat, index) => {
        return (
          <View
            key={stat.date + '_' + index}
            style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{flex: 2}}>
              <TouchableRipple
                style={{paddingVertical: 5}}
                onPress={() =>
                  navigation.navigate('Player Match Screen', {
                    matchId: stat.matchId,
                  })
                }>
                <Text style={{color: 'purple'}} variant="labelLarge">
                  {DateTime.fromISO(stat.date).toFormat('dd.MM.yyyy')}
                </Text>
              </TouchableRipple>
            </View>
            <View style={{flex: 1}}>
              <Text>
                {stat.singlesPlayed}/{stat.singlesWon}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text>
                {stat.doublesPlayed}/{stat.doublesWon}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text>
                {stat.doublesPlayed}/{stat.doublesWon}
              </Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}

export default StatsMatchPerformance
