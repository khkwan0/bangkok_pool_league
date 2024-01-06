import React from 'react'
import {View} from './View'
import {Animated, StyleSheet} from 'react-native'
import {DEFAULT_INTL_CONFIG} from 'react-intl/src/utils'
import {useWindowDimensions} from 'react-native'

export const Progress = props => {
  const {width} = useWindowDimensions()
  const min = props.min ?? 0
  const max = props.max ?? 100

  let perc = 0
  if (props.value > min && props.value <= max) {
    perc = (props.value / max) * 100
  } else if (props.value > max) {
    perc = 100
  }

  let height = 20
  if (typeof props.size !== 'undefined') {
    switch (props.size) {
      case 'xs':
        height *= 0.25
        break
      case 'sm':
        height *= 0.5
        break
      case 'lg':
        height *= 1.25
        break
      case 'xl':
        height *= 1.5
        break
      case '2xl':
        height *= 2
        break
      default:
        break
    }
  }

  return (
    <View
      flexDirection="row"
      borderColor={props.borderColor ?? '#000'}
      borderWidth={1}
      w={width * 0.82}
      height={height}
      mb={5}
      borderRadius={5}>
      <View
        style={
          ([StyleSheet.absoluteFill],
          {backgroundColor: props._fill ?? '#0f0', width: `${perc}%`})
        }
      />
    </View>
  )
}
