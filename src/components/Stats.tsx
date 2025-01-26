import React from 'react'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'

const Stats = ({stats}) => {
  return (
    <>
      {Object.keys(stats).map((gameType, index) => {
        const margin = gameType === 'Total' ? 10 : 0
        const fw = gameType === 'Total' ? 'bold' : 'normal'
        return (
          <View className="flex-row" key={gameType + '_' + index} my={margin}>
            <View flex={2} className="w-2/6">
              <Text style={{fontWeight: fw}}>{gameType}</Text>
            </View>
            <View flex={1} className="w-1/6">
              <Text style={{fontWeight: fw}}>{stats[gameType].played}</Text>
            </View>
            <View flex={1} className="w-1/6">
              <Text style={{fontWeight: fw}}>{stats[gameType].won}</Text>
            </View>
            <View flex={1} className="w-1/6">
              <Text style={{fontWeight: fw}}>{stats[gameType].winp}</Text>
            </View>
            <View flex={1} className="w-1/6">
              <Text style={{fontWeight: fw}}>{stats[gameType].wgtd}</Text>
            </View>
          </View>
        )
      })}
    </>
  )
}

export default Stats
