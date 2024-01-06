import React from 'react'
import {Text} from './Text'
import {View} from './View'
import {Pressable, useWindowDimensions} from 'react-native'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'

export const ToolTipFramework = props => {
  // tooltip states
  const theme = props.theme
  const {width, height} = useWindowDimensions()
  const [layout, setLayout] = React.useState({})

  if (props.isOpen) {
    const pressedY = props.pressedY
    const pressedX = props.pressedX
    const pressableHeight = props.toolTipPressableHeight ?? 0

    const backgroundColor =
      props.backgroundColor ??
      theme.toolTipBackgroundColor ??
      'rgb(240, 224, 146)'
    const roundness = props.roundness ?? theme.roundness ?? 8
    const padding = props.padding ?? theme.toolTipPadding ?? 20
    const toolTipTitle = props.title ?? 'Tip'
    const left = width / 2 - (width / 2 - pressedX - 20)

    //   const top = -((layout.height ?? 0) + pressableHeight + padding * 2)
    const top =
      pressedY > height / 2
        ? -((layout.height ?? 0) + pressableHeight * 2 - pressedY + padding * 2)
        : pressedY + pressableHeight

    return (
      <View
        style={{
          position: 'absolute',
          zIndex: 50,
          top: top,
          left: left,
          backgroundColor: backgroundColor,
          padding: padding,
          borderRadius: roundness,
          maxWidth: width * 0.8,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <MCI name="tooltip-outline" size={20} color="#000" />
            <Text>&nbsp;</Text>
            <Text>{toolTipTitle}</Text>
          </View>
          <View style={{flex: 1, alignItems: 'flex-end'}}>
            <Pressable onPress={() => props.onClose()}>
              <MCI name="close" size={30} color="#000" />
            </Pressable>
          </View>
        </View>
        <Text onLayout={e => setLayout(e.nativeEvent.layout)}>{props.tip}</Text>
      </View>
    )
  } else {
    return null
  }
}
