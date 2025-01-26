import React from 'react'
import {Pressable} from 'react-native'
import { ThemedView as View } from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {DateTime} from 'luxon'
import {useNavigation} from '@react-navigation/native'

const StatsMatchPerformance = ({stats}) => {
  const navigation = useNavigation()
  return (
    <View>
      {stats.map((stat, index) => {
        return (
          <View className="flex-row items-center" key={stat.date + '_' + index}>
            <View className="w-2/5" flex={2}>
              <Pressable
                style={{paddingVertical: 5}}
                onPress={() =>
                  navigation.navigate('Player Match Screen', {
                    matchId: stat.matchId,
                  })
                }>
                <Text style={{color: 'purple'}} variant="labelLarge">
                  {DateTime.fromISO(stat.date).toFormat('dd.MM.yyyy')}
                </Text>
              </Pressable>
            </View>
            <View className="w-1/5" flex={1}>
              <Text>
                {stat.singlesPlayed}/{stat.singlesWon}
              </Text>
            </View>
            <View className="w-1/5" flex={1}>
              <Text>
                {stat.doublesPlayed}/{stat.doublesWon}
              </Text>
            </View>
            <View className="w-1/5" flex={1}>
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
