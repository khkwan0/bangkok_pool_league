import {View as RNView} from 'react-native'
import {Factory} from './Factory'

export const View = props => {
  const Component = Factory(RNView, props)
  return Component
}
