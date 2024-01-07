import React from 'react'
import {Text as RNText, PixelRatio, Dimensions, Platform} from 'react-native'
import {YBaseContext} from './YBaseProvider'
import {Factory} from './Factory'
import {useTranslation} from 'react-i18next'

export const Text = props => {
  const {t} = useTranslation()
  const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window')
  const scale = SCREEN_WIDTH / 320
  const {HeightScale} = React.useContext(YBaseContext)
  let fontSize = props.fontSize

  function normalize(size) {
    const newSize = size * scale
    if (Platform.OS === 'ios') {
      return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 4
    } else {
      return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
    }
  }

  if (typeof props.size !== 'undefined') {
    switch (props.size) {
      case 'xs':
        fontSize = normalize(10)
        break
      case 'sm':
        fontSize = normalize(12)
        break
      case 'md':
        fontSize = normalize(14)
        break
      case 'lg':
        fontSize = normalize(16)
        break
      case 'xl':
        fontSize = normalize(18)
        break
      case '2xl':
      case 'xxl':
        fontSize = normalize(20)
        break
      case '3xl':
      case 'xxxl':
        fontSize = normalize(22)
        break
      default:
        break
    }
  }

  if (typeof props.fontSize !== 'undefined') {
    switch (props.fontSize) {
      case 'xs':
        fontSize = normalize(10)
        break
      case 'sm':
        fontSize = normalize(12)
        break
      case 'md':
        fontSize = normalize(14)
        break
      case 'lg':
        fontSize = normalize(16)
        break
      case 'xl':
        fontSize = normalize(18)
        break
      case '2xl':
      case 'xxl':
        fontSize = normalize(20)
        break
      case '3xl':
      case 'xxxl':
        fontSize = normalize(22)
        break
      default:
        break
    }
  }

  const _style = {
    fontWeight: props.fontWeight ?? props.bold ? 'bold' : 'normal',
    fontSize: !isNaN(parseInt(fontSize, 10))
      ? HeightScale(fontSize)
      : HeightScale(14),
  }
  const txtProps = {
    ...props,
    children:
      typeof props.children === 'object' ? props.children : t(props.children),
  }
  const Component = Factory(RNText, txtProps, _style)
  return Component
}
