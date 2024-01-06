import {View as RNView} from 'react-native'
import {Factory} from './Factory'

export const Row = props => {
  const Component = Factory(RNView, props, {
    flexDirection: 'row',
    gap: props.space ?? 0,
  })
  return Component
}
