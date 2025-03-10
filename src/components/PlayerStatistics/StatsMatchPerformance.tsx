import React from 'react'
import {Pressable} from 'react-native'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {DateTime} from 'luxon'
import {useRouter} from 'expo-router'

type ValidPath = '/(tabs)/completed/match'

type StatType = {
  date: string
  matchId: number
  singlesWon: number
  singlesPlayed: number
  doublesWon: number
  doublesPlayed: number
}

const StatsMatchPerformance = ({
  stats,
  path,
}: {
  stats: StatType[]
  path: ValidPath
}) => {
  const router = useRouter()
  return (
    <View>
      {stats.map((stat: StatType, index: number) => {
        return (
          <View className="flex-row items-center" key={stat.date + '_' + index}>
            <View flex={3}>
              <Pressable
                style={{paddingVertical: 5}}
                onPress={() =>
                  router.dismissTo({
                    pathname: path ?? '/(tabs)/completed/match',
                    params: {
                      params: JSON.stringify({
                        matchId: stat.matchId,
                      }),
                    },
                  })
                }>
                <Text type="link">
                  {DateTime.fromISO(stat.date).toLocaleString(
                    DateTime.DATE_MED,
                  )}
                </Text>
              </Pressable>
            </View>
            <View flex={2} className="items-center">
              <Text>
                {stat.singlesWon}/{stat.singlesPlayed}
              </Text>
            </View>
            <View flex={3} className="items-end">
              <Text>
                {stat.doublesWon}/{stat.doublesPlayed}
              </Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}

export default StatsMatchPerformance
