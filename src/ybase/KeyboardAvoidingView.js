import React from 'react'
import {KeyboardAvoidingView as RNKav} from 'react-native'
import {Factory} from './Factory'

export const KeyboardAvoidingView = props => {
  const Component = Factory(RNKav, props)
  return Component
}
