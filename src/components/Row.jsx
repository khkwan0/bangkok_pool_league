import React from 'react'
import {View} from 'react-native'

const Row = props => {
  const _props = {...props}
  delete(_props.children)
  return (
    <View style={[{flexDirection: 'row'}, {...props}]}>{props.children}</View>
  )
}

export default Row
