import React from 'react'
import {View} from 'react-native'
import {Text} from 'react-native-paper'

const TwoColumns = props => {
  return (
    <View style={[{flexDirection: 'row', alignItems: 'center', gap: props.style?.gap ?? 10}, {...props.style}]}>
      <View style={{flex:1, alignItems: 'flex-end' }}>
        <Text>{props.label}</Text>
      </View>
      <View style={{flex:2 }}>
        {props.children}
      </View>
    </View>
  )
}

export default TwoColumns