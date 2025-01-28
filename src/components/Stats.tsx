import React from 'react'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'

interface StatsType {
  [gameType: string]: {
    played: number
    won: number
    winp: number
  }
}

const Stats = ({stats}: {stats: StatsType}) => {
  return (
    <>
      {Object.keys(stats).map((gameType, index) => {
        const margin = gameType === 'Total' ? 10 : 0
        const fw = gameType === 'Total' ? 'bold' : 'normal'
        return (
          <View
            className="flex-row"
            key={gameType + '_' + index}
            style={{marginVertical: margin}}>
            <View style={{flex: 2}}>
              <Text style={{fontWeight: fw}}>{gameType}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontWeight: fw}}>
                {String(stats[gameType].played)}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontWeight: fw}}>
                {String(stats[gameType].won)}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontWeight: fw}}>
                {String(stats[gameType].winp)}
              </Text>
            </View>
          </View>
        )
      })}
    </>
  )
}

export default Stats
