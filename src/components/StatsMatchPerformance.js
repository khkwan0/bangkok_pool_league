import React from 'react'
import {TouchableRipple} from 'react-native-paper'
import {Row, Text, View} from '@ybase'
import {DateTime} from 'luxon'
import {useNavigation} from '@react-navigation/native'

const StatsMatchPerformance = ({stats}) => {
  const navigation = useNavigation()
  return (
    <View>
      {stats.map((stat, index) => {
        return (
          <Row alignItems="center" key={stat.date + '_' + index}>
            <View flex={2}>
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
            <View flex={1}>
              <Text>
                {stat.singlesPlayed}/{stat.singlesWon}
              </Text>
            </View>
            <View flex={1}>
              <Text>
                {stat.doublesPlayed}/{stat.doublesWon}
              </Text>
            </View>
            <View flex={1}>
              <Text>
                {stat.doublesPlayed}/{stat.doublesWon}
              </Text>
            </View>
          </Row>
        )
      })}
    </View>
  )
}

export default StatsMatchPerformance
