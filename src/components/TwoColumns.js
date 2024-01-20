import React from 'react'
import {Row, Text, View} from '@ybase'

const TwoColumns = props => {
  return (
    <Row
      flex={1}
      alignItems="center"
      space={props.gap ?? 10}
      style={{...props.style}}>
      <View flex={1} alignItems="flex-end">
        <Text>{props.label}</Text>
      </View>
      <View flex={4}>{props.children}</View>
    </Row>
  )
}

export default TwoColumns
