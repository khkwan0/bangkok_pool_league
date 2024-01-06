import React from 'react'
import {Pressable} from 'react-native'
import {Text} from '@ybase/Text'
import {Icon} from '@ybase/Icon'
import {Row} from './Row'
import {YBaseContext} from '@ybase/YBaseProvider'
import {ActivityIndicator} from './ActivityIndicator'
import {useWindowDimensions} from 'react-native'

export const Button = props => {
  const {width} = useWindowDimensions()
  const {theme, colorMode} = React.useContext(YBaseContext)
  const colors = theme.palette[colorMode].colors
  const isGhost = props.variant?.toLowerCase() === 'ghost'
  const backgroundColor = props.bgColor ?? colors.primary
  const disabledBackgroundColor = colors.onSurfaceDisabled
  const disabledColor = theme.onSurfaceDisabled
  const ghostPressedColor = '#f00'
  const ghostUnpressedColor = colors.primary
  const pressedBackgroundColor = '#007'
  const pressedColor = isGhost
    ? ghostPressedColor
    : props.style?.color ?? '#6d83cf'
  const unpressedColor = isGhost
    ? colorMode === 'dark'
      ? colors.onSurface
      : ghostUnpressedColor
    : props.color ?? colors.onPrimary

  const [isPressed, setIsPressed] = React.useState(false)

  return (
    <Pressable
      borderWidth={props.borderWidth ?? 0}
      disabled={props.disabled}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={props.onPress}
      maxWidth={props.maxWidth ?? width}
      minWidth={props.minWidth ?? 0}
      style={pressed => {
        return [
          {
            paddingVertical: props.py ?? 18,
            paddingHorizontal: props.px ?? 18,
            borderRadius: theme.roundness,
            borderColor: props.borderColor ?? '',
          },
          {
            backgroundColor: isGhost
              ? 'transparent'
              : props.disabled || props.isLoading || props.loading
              ? disabledBackgroundColor
              : pressed.pressed // otherwise - check if pressed
              ? pressedBackgroundColor // pressed background color
              : backgroundColor, // not pressed
          },
        ]
      }}>
      <Row
        bgColor="transparent"
        justifyContent="center"
        space={5}
        alignItems="center">
        {typeof props.leftIcon !== 'undefined' && <>{props.leftIcon}</>}
        <Text
          color={
            props.disabled
              ? disabledColor
              : isPressed
              ? pressedColor
              : unpressedColor
          }
          bold>
          {props.children}
        </Text>
        {typeof props.rightIcon !== 'undefined' && <>{props.rightIcon}</>}
        {(props.isLoading || props.loading) && <ActivityIndicator />}
      </Row>
    </Pressable>
  )
}
