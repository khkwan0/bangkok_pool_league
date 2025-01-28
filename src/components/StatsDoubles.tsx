import React from 'react'
import {Pressable} from 'react-native'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'

type StatType = {
  playerId: number
  nickname: string
  played: number
  won: number
  winp: number
  wgtd: number
}

interface PropType {
  stats: Array<StatType>
  playerSelect: any
}

export default function StatsDoubles(props: PropType) {
  const stats = props.stats
  return (
    <>
      {stats.map((stat, index) => {
        const playerId = stat.playerId
        return (
          <View className="flex-row" key={stat + '_' + index}>
            <Pressable
              onPress={() => props.playerSelect(playerId)}
              className="w-2"
              style={{flex: 2}}>
              <Text type="link">{stat.nickname}</Text>
            </Pressable>
            <View style={{flex: 1}}>
              <Text>{stat.played}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text>{stat.won}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text>{stat.winp}</Text>
            </View>
          </View>
        )
      })}
    </>
  )
}
