import React from 'react'
import {YBaseContext} from './YBaseProvider'

export const Factory = (component, props, defaultStyle = {}) => {
  const {theme, colorMode} = React.useContext(YBaseContext)
  let {children, style, ...rest} = props
  const _style = {
    fontWeight: props.fontWeight ?? props.bold ? 'bold' : 'normal',
    color: props.color ?? theme.palette[colorMode].colors.onSurface,
    fontSize: !isNaN(parseInt(props.fontSize, 10)) ? props.fontSize : undefined,
    paddingBottom: props.pb,
    paddingTop: props.pt,
    paddingLeft: props.pl,
    paddingRight: props.pr,
    paddingHorizontal: props.px,
    paddingVertical: props.py,
    padding: props.p,
    marginBottom: props.mb,
    marginLeft: props.ml,
    marginRight: props.mr,
    marginTop: props.mt,
    marginHorizontal: props.mx,
    marginVertical: props.my,
    margin: props.m,
    backgroundColor: props.bgColor,
    width: props.w ?? props.width,
    height: props.h ?? props.height,
    borderRadius: props.borderRadius,
    flex: props.flex,
    alignItems: props.alignItems,
    flexDirection: props.flexDirection,
    borderColor: props.borderColor,
    justifyContent: props.justifyContent,
    borderWidth: props.borderWidth,
    gap: props.gap,
    flexGrow: props.flexGrow,
    textAlign: props.textAlign,
  }

  // override the styles above with defaultStyle (if defined)
  if (typeof defaultStyle !== 'undefined') {
    Object.keys(_style).forEach(styleName => {
      if (typeof defaultStyle[styleName] !== 'undefined') {
        if (typeof _style[styleName] === 'undefined') {
          _style[styleName] = defaultStyle[styleName]
        }
      }
    })
  }

  // handle props.style
  let finalStyle = {}
  if (Array.isArray(style)) {
    style.forEach(__style => {
      finalStyle = {
        ...finalStyle,
        ...__style,
      }
    })
  } else {
    finalStyle = {...style}
  }
  const YBaseComponent = component
  return (
    <YBaseComponent style={[{..._style}, {...finalStyle}]} {...rest}>
      {props.children}
    </YBaseComponent>
  )
}
