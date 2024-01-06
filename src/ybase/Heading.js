import React from 'react'
import {Text} from './Text'
import {YBaseContext} from './YBaseProvider'

export const Heading = props => {
  const {theme, colorMode} = React.useContext(YBaseContext)
  const {children, style, ...rest} = props

  const {HeightScale} = React.useContext(YBaseContext)
  let fontSize = props.fontSize
  if (typeof props.size !== 'undefined') {
    switch (props.size) {
      case 'xs':
        fontSize = 10
        break
      case 'sm':
        fontSize = 12
        break
      case 'md':
        fontSize = 14
        break
      case 'lg':
        fontSize = 16
        break
      case 'xl':
        fontSize = 18
        break
      case '2xl':
        fontSize = 20
        break
      default:
        break
    }
  }

  if (typeof props.fontSize !== 'undefined') {
    switch (props.fontSize) {
      case 'xs':
        fontSize = 10
        break
      case 'sm':
        fontSize = 12
        break
      case 'md':
        fontSize = 14
        break
      case 'lg':
        fontSize = 16
        break
      case 'xl':
        fontSize = 18
        break
      case '2xl':
        fontSize = 20
        break
      default:
        break
    }
  }

  const _style = {
    fontWeight: props.fontWeight ?? props.bold ? 'bold' : 'normal',
    color: props.color ?? theme.palette[colorMode].colors.onSurface,
    fontSize: !isNaN(parseInt(fontSize, 10))
      ? HeightScale(fontSize)
      : HeightScale(14),
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
    backgroundColor: props.bgColor,
    width: props.w,
    borderRadius: props.borderRadius,
    flex: props.flex,
    alignItems: props.alignItems,
    flexDirection: props.flexDirection,
    borderColor: props.borderColor,
    justifyContent: props.justifyContent,
    borderWidth: props.borderWidth,
  }

  return (
    <Text style={[_style, {...style}]} {...rest}>
      {props.children}
    </Text>
  )
}
