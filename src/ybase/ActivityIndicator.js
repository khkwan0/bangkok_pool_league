import {ActivityIndicator as RNActivityIndicator} from 'react-native'
import {Factory} from './Factory'

export const ActivityIndicator = props => {
  const Component = Factory(RNActivityIndicator, props)
  return Component
}
