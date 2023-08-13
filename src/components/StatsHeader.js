import React from 'react'
import {View} from 'react-native'
import {Text} from 'react-native-paper'

const StatsHeader = props => {
  const header = props.isDoubles
    ? 'Doubles'
    : props.isMatchPerformance
    ? 'Match Performance'
    : 'Frames'
  return (
    <View style={{flexDirection: 'row', backgroundColor: '#eee', padding: 5}}>
      <View style={{flex: 2}}>
        <Text>{header}</Text>
      </View>
      {!props.isMatchPerformance && (
        <>
          <View style={{flex: 1}}>
            <Text>Played</Text>
          </View>
          <View style={{flex: 1}}>
            <Text>Won</Text>
          </View>
          <View style={{flex: 1}}>
            <Text>Win %</Text>
          </View>
          <View style={{flex: 1}}>
            <Text>Wgtd %</Text>
          </View>
        </>
      )}
      {props.isMatchPerformance && (
        <>
          <View style={{flex: 1}}>
            <Text>Sgl.</Text>
          </View>
          <View style={{flex: 1}}>
            <Text>Dbl.</Text>
          </View>
          <View style={{flex: 1}}>
            <Text>Wgtd %</Text>
          </View>
        </>
      )}
    </View>
  )
}

export default StatsHeader
