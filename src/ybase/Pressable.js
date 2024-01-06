import React from 'react'
import {Pressable as RNPressable} from 'react-native'
import {YBaseContext} from './YBaseProvider'

export const Pressable = props => {
  const {style, children, ...rest} = props
  const {theme, colorMode} = React.useContext(YBaseContext)
  const colors = theme.palette[colorMode].colors
  const defaultBackgroundColor =
    props.defaultBackgroundColor ?? props.bgColor ?? 'transparent'
  const _style = {
    fontWeight: props.fontWeight ?? props.bold ? 'bold' : 'normal',
    color: props.color ?? theme.palette[colorMode].colors.onSurface,
    fontSize: !isNaN(parseInt(props.fontSize, 10)) ? props.fontSize : 14,
    paddingBottom: props.pb,
    paddingTop: props.pt,
    paddingHorizontal: props.px,
    paddingVertical: props.py,
    padding: props.p,
    marginBottom: props.mb,
    marginTop: props.mt,
    marginHorizontal: props.mx,
    marginVertical: props.my,
    margin: props.m,
    paddingRight: props.pr,
    //     backgroundColor: props.bgColor ?? defaultBackgroundColor,
    width: props.w,
    borderRadius: props.borderRadius,
    flex: props.flex,
    alignItems: props.alignItems,
    flexDirection: props.flexDirection,
    borderColor: props.borderColor,
    justifyContent: props.justifyContent,
    borderWidth: props.borderWidth,
  }
  const pressedBackgroundColor =
    props.pressedBackgroundColor ?? colors.inversePrimary

  return (
    <RNPressable
      onPress={props.onPress}
      style={({pressed}) => [
        {..._style},
        {
          backgroundColor:
            pressed && props.highlight
              ? pressedBackgroundColor
              : defaultBackgroundColor,
        },
        {...style},
      ]}
      {...rest}>
      {children}
    </RNPressable>
  )
}
