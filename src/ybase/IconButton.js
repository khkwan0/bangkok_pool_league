import React from 'react'
import {Pressable} from './Pressable'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'

export const IconButton = props => {
  const {style, ...rest} = props
  return (
    <Pressable
      onPress={props.onPress}
      style={({pressed}) => {
        const toReturn = []
        if (pressed && typeof props._pressed !== 'undefined') {
          toReturn.push(props._pressed)
        }
        toReturn.push(style)
        return toReturn
      }}
      {...rest}>
      <MCI name={props.name} size={props.size} color={props.color} />
    </Pressable>
  )
}
