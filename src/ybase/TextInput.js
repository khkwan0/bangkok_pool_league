import React from 'react'
import {forwardRef} from 'react'
import {TextInput as RNTextInput} from 'react-native'
import {View} from './View'
import {Row} from './Row'
import {YBaseContext} from './YBaseProvider'

export const TextInput = forwardRef((props, ref) => {
  const {theme, colorMode} = React.useContext(YBaseContext)
  const colors = theme.palette[colorMode].colors
  const defaultBackgroundColor = colors.onPrimarySurface
  const defaultBorderRadius = theme.roundness
  const [isFocused, setIsFocused] = React.useState(false)
  const [borderColor, setBorderColor] = React.useState(colors.outline)
  let {children, style, onFocus, onBlur, onSubmitEditing, ...rest} = props
  let _style = {
    fontWeight: props.fontWeight ?? props.bold ? 'bold' : 'normal',
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
    backgroundColor: props.bgColor,
    width: props.w,
    borderRadius: props.borderRadius ?? defaultBorderRadius,
    flex: props.flex,
    alignItems: props.alignItems,
    borderColor: borderColor ?? colors.outline,
    justifyContent: props.justifyContent,
    borderWidth: props.borderWidth ?? 1,
    maxWidth: props.maxWidth,
  }

  // allows passing in an array of styles
  const styleKeys = Object.keys(_style)
  const finalProps = {}
  Object.keys(rest).forEach(prop => {
    if (!styleKeys.includes(prop)) {
      finalProps[prop] = rest[prop]
    }
  })

  React.useEffect(() => {
    if (props.borderColor) {
      setBorderColor(props.borderColor)
    }
  }, [props.borderColor])

  const HandleOnFocus = e => {
    if (typeof props.onFocus === 'function') {
      props.onFocus(e)
    }
    setIsFocused(true)
  }

  const HandleOnBlur = e => {
    if (typeof props.onBlur === 'function') {
      props.onBlur(e)
    }
    setIsFocused(false)
  }

  const HandleSubmit = (text, eventCount, target) => {
    if (typeof props.onSubmitEditing === 'function') {
      props.onSubmitEditing(text, eventCount, target)
    }
  }
  if (isFocused && typeof props._focus !== 'undefined') {
    _style = {
      ..._style,
      ...props._focus,
    }
  }
  return (
    <Row
      alignItems="center"
      bgColor={colors.background}
      borderRadius={theme.roundness}
      space={10}
      borderColor={borderColor}
      borderWidth={1}
      style={{...props.style}}>
      <View
        height={props.height ?? 60}
        justifyContent="center"
        style={{...props.inputLeftStyle}}>
        {props.inputLeftElement ?? null}
      </View>
      <View flex={5}>
        <RNTextInput
          fontSize={_style.fontSize}
          color={props.color ?? colors.onSurface}
          placeholderTextColor={props.color ?? colors.onSurface}
          ref={ref}
          onSubmitEditing={(text, eventCount, target) =>
            HandleSubmit(text, eventCount, target)
          }
          onFocus={e => HandleOnFocus(e)}
          onBlur={e => HandleOnBlur(e)}
          {...finalProps}
        />
      </View>
      <View
        alignItems="center"
        justifyContent="center"
        height={props.height ?? 60}
        style={{...props.inputRightStyle}}>
        {props.inputRightElement}
      </View>
    </Row>
  )
  /*
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          borderWidth: 1,
          bordercolor: 'blue',
          backgroundColor: defaultBackgroundColor,
          borderRadius: defaultBorderRadius,
        },
        {
          flexDirection: 'row',
          flex: 1,
          alignItems: 'center',
        },
        {..._style},
        {...style},
      ]}
      {...rest}>
      {typeof props.inputLeftElement !== 'undefined' &&
        props.inputLeftElement && (
          <View style={[{...props.leftStyle}, {flex: 5}]}>
            {props.inputLeftElement}
          </View>
        )}
      <View style={{flex: 1, backgroundColor: 'red'}}>
        <RNTextInput
          cursorColor={props.cursorColor ?? '#000'}
          style={[
            {
              borderRadius: defaultBorderRadius,
              backgroundColor:
                props?.style?.backgroundColor ?? defaultBackgroundColor,
              color: '#111',
              marginLeft:
                typeof props.inputLeftElement !== 'undefined' &&
                props.inputLeftElement
                  ? 0
                  : 10,
            },
          ]}
          onChangeText={props.onChangeText}
          clearTextOnFocus={props.clearTextOnFocus ?? false}
          value={props.value}
          secureTextEntry={props.secureTextEntry ?? false}
          ref={ref}
          placeholder={props.placeholder ?? ''}
          placeholderTextColor={'#aaa'}
          keyboardType={props.keyboardType ?? 'default'}
        />
      </View>
      {typeof props.inputRightElement !== 'undefined' &&
        props.inputRightElement && (
          <View
            style={[
              {
                flex:
                  typeof props.inputLeftElement === 'undefined' ||
                  !props.inputLeftElement
                    ? 0.75
                    : 1,
                backgroundColor:
                  props?.style?.backgroundColor ?? defaultBackgroundColor,
              },
              {...props.rightStyle},
            ]}>
            {props.inputRightElement}
          </View>
        )}
    </View>
  )
  */
})
