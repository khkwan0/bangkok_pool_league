import React from 'react'
import {View as Box} from './View'
import Images from '~/assets/img/auth/images'
import {YBaseContext} from '@ybase/YBaseProvider'

export const Popover = props => {
  const {colorMode} = React.useContext(YBaseContext)
  return props.isShowPopOver ? (
    <Box
      position={'absolute'}
      top={props.xPos.toppos ?? props.xPos.xPosition - props.xPos.height}
      width={props.xPos.width ?? '100%'}>
      <Box
        width={props.xPos.width ?? '100%'}
        alignItems={'center'}
        position={'absolute'}>
        {colorMode === 'light' ? (
          <Images.tooltipDark
            width={props.xPos.width ?? '100%'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        ) : (
          <Images.tooltipLight
            width={props.xPos.width ?? '100%'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}
      </Box>
      {props.body}
    </Box>
  ) : null
}
