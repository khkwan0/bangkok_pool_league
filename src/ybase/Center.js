import {View as RNView} from 'react-native'
import {Factory} from './Factory'

export const Center = props => {
  const centerProps = {
    flex: 1,
    alignItems: 'center',
    justifyContent: props.justifyContent ?? 'center',
  }

  const Component = Factory(RNView, props, centerProps)
  return Component
}
