import React from 'react'
import {ScrollView as RNScrollView} from 'react-native'
import {YBaseContext} from './YBaseProvider'

export const ScrollView = props => {
  const {children, style, ...rest} = props
  const {theme, colorMode} = React.useContext(YBaseContext)
  const _style = {
    fontWeight: props.fontWeight ?? props.bold ? 'bold' : 'normal',
    color: props.color ?? theme.palette[colorMode].colors.onSurface,
    fontSize: !isNaN(parseInt(props.fontSize, 10)) ? props.fontSize : undefined,
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
    width: props.w,
    borderRadius: props.borderRadius,
    flex: props.flex,
    alignItems: props.alignItems,
    flexDirection: props.flexDirection,
    borderColor: props.borderColor,
    justifyContent: props.justifyContent,
    borderWidth: props.borderWidth,
    gap: props.gap,
    textAlign: props.textAlign,
  }

  return (
    <RNScrollView style={[{..._style}, {...style}]} {...rest}>
      {children}
    </RNScrollView>
  )
}
