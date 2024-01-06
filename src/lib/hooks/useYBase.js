import React from 'react'
import {YBaseContext} from '@ybase/YBaseProvider'
export const useYBase = props => {
  const {theme, colorMode, setColorMode, closeBottomSheet} = React.useContext(YBaseContext)

  const colors = theme.palette[colorMode].colors

  return {
    colors,
    theme,
    colorMode,
    setColorMode,
    closeBottomSheet,
  }
}
