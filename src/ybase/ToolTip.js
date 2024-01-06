import React from 'react'
import {View} from './View'
import {Text} from './Text'
import {Platform, Pressable, useWindowDimensions} from 'react-native'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useDisclose} from '~/lib/hooks'
import {YBaseContext} from './YBaseProvider'

export const ToolTip = props => {
  const toolTip = React.useContext(YBaseContext)

  return (
    <View>
      <Pressable
        onPress={e => {
          toolTip.setPressedY(e.nativeEvent.pageY)
          toolTip.openToolTip()
        }}
        onLayout={e => toolTip.setPressableHeight(e.nativeEvent.layout.height)}>
        <MCI name="information" size={30} color="#000" />
      </Pressable>
    </View>
  )
}
