import React from 'react'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {YBaseContext} from './YBaseProvider'

export const Icon = props => {
  const {theme, colorMode} = React.useContext(YBaseContext)

  return <MCI name={props.name} size={props.size} color={props.color} />
}
