import React from 'react'
import {View as RNView} from 'react-native'
import {Factory} from './Factory'
import {useYBase} from '~/lib/hooks'

export const Divider = props => {
  const {colors} = useYBase()
  const Component = Factory(RNView, props, {
    borderWidth: 0.5,
    borderColor: props.borderColor ?? colors.onSurfaceVariant,
  })
  return Component
}
