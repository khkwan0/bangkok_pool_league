import React from 'react'
import {View as RNView} from 'react-native'
import {Factory} from './Factory'

export const VStack = props => {
  const viewProps = {
    ...props,
    onLayout: props.onLayout,
  }

  const Component = Factory(RNView, viewProps, {
    flexDirection: 'column',
    gap: props.space ?? 0,
  })
  return Component
}
