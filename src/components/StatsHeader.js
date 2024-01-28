import React from 'react'
import {Row, Text, View} from '@ybase'

const StatsHeader = props => {
  const header = props.isDoubles
    ? 'Doubles'
    : props.isMatchPerformance
    ? 'Match Performance'
    : 'Frames'
  return (
    <Row>
      <View flex={2}>
        <Text bold>{header}</Text>
      </View>
      {!props.isMatchPerformance && (
        <>
          <View flex={1}>
            <Text bold>Played</Text>
          </View>
          <View flex={1}>
            <Text bold>Won</Text>
          </View>
          <View flex={1}>
            <Text bold>Win %</Text>
          </View>
          <View flex={1}>
            <Text bold>Wgtd %</Text>
          </View>
        </>
      )}
      {props.isMatchPerformance && (
        <>
          <View flex={1}>
            <Text bold>Sgl.</Text>
          </View>
          <View flex={1}>
            <Text bold>Dbl.</Text>
          </View>
          <View flex={1}>
            <Text bold>Wgtd %</Text>
          </View>
        </>
      )}
    </Row>
  )
}

export default StatsHeader
