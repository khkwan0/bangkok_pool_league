import React from 'react'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'

interface PropType {
  isDoubles: boolean
  isMatchPerformance: boolean
}

export default function StatsHeader(props: PropType) {
  const header = props.isDoubles
    ? 'Doubles'
    : props.isMatchPerformance
      ? 'Match Performance'
      : 'Frames'
  return (
    <View className="flex-row">
      {!props.isMatchPerformance && (
        <>
          <View flex={2}>
            <Text className="font-bold">
              {props.isDoubles ? 'partner' : 'game_type'}
            </Text>
          </View>
          <View flex={1}>
            <Text className="font-bold">played</Text>
          </View>
          <View flex={1}>
            <Text className="font-bold">won</Text>
          </View>
          <View flex={1}>
            <Text className="font-bold text-center">
              <Text>win</Text> %
            </Text>
          </View>
        </>
      )}
      {props.isMatchPerformance && (
        <>
          <View flex={3}>
            <Text className="font-bold">Date</Text>
          </View>
          <View flex={2} className="items-center">
            <Text className="font-bold">Sgl.</Text>
            <Text>Played/Won</Text>
          </View>
          <View flex={3} className="items-end">
            <Text className="font-bold">Dbl.</Text>
            <Text>Played/Won</Text>
          </View>
        </>
      )}
    </View>
  )
}
