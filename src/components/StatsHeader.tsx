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
      <View className="w-2/3">
        <Text className="font-bold">{header}</Text>
      </View>
      {!props.isMatchPerformance && (
        <>
          <View className="w-1/4">
            <Text className="font-bold">Played</Text>
          </View>
          <View className="w-1/4">
            <Text className="font-bold">Won</Text>
          </View>
          <View className="w-1/4">
            <Text className="font-bold">Win %</Text>
          </View>
          <View className="w-1/4">
            <Text className="font-bold">Wgtd %</Text>
          </View>
        </>
      )}
      {props.isMatchPerformance && (
        <>
          <View className="w-1/3">
            <Text className="font-bold">Sgl.</Text>
          </View>
          <View className="w-1/3">
            <Text className="font-bold">Dbl.</Text>
          </View>
          <View className="w-1/3">
            <Text className="font-bold">Wgtd %</Text>
          </View>
        </>
      )}
    </View>
  )
}
