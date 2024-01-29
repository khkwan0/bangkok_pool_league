import React from 'react'
import {Pressable} from 'react-native'
import {Text} from '@ybase/Text'
import {Icon} from '@ybase/Icon'
import {Row} from './Row'
import {YBaseContext} from '@ybase/YBaseProvider'
import {ActivityIndicator} from './ActivityIndicator'
import {useWindowDimensions} from 'react-native'
import {useYBase} from '~/lib/hooks'

export const Button = props => {
  const {width} = useWindowDimensions()
  const {theme, colorMode} = React.useContext(YBaseContext)
  const {colors} = useYBase()
  const isGhost = props.variant?.toLowerCase() === 'ghost'
  const isOutline = props.variant?.toLowerCase() === 'outline'
  const backgroundColor = isOutline
    ? colors.transparent
    : props.bgColor ?? colors.primary
  const disabledBackgroundColor = colors.onSurfaceDisabled
  const disabledColor = theme.onSurfaceDisabled
  const ghostPressedColor = '#f00'
  const ghostUnpressedColor = colors.onSurface
  const pressedBackgroundColor = '#007'
  const outlinePressedColor = colors.transparent
  const pressedColor = isOutline
    ? outlinePressedColor
    : isGhost
    ? ghostPressedColor
    : props.style?.color ?? '#6d83cf'
  const unpressedColor = isOutline
    ? colors.transparent
    : isGhost
    ? colorMode === 'dark'
      ? colors.onSurface
      : ghostUnpressedColor
    : props.color ?? colors.onPrimary

  const [isPressed, setIsPressed] = React.useState(false)

  const shadow =
    !isOutline && !isGhost
      ? {
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.8,
          shadowRadius: 2,
          elevation: 5,
        }
      : {}

  return (
    <Pressable
      borderWidth={isOutline ? 1 : props.borderWidth ?? 0}
      disabled={props.disabled}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={props.onPress}
      maxWidth={props.maxWidth ?? width}
      minWidth={props.minWidth ?? 0}
      style={pressed => {
        return [
          shadow,
          {
            paddingVertical: props.py ?? 18,
            paddingHorizontal: props.px ?? 18,
            borderRadius: theme.roundness,
            borderColor: isOutline ? colors.outline : props.borderColor ?? '',
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
