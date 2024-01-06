import React from 'react'
import {YBaseContext} from './YBaseProvider'
import {Pressable} from './Pressable'
import {View} from './View'

const ActionSheet = props => {
  const actionSheet = React.useContext(YBaseContext)
  const [title, setTitle] = React.useState(props.title ?? '')
  const [showClose, setShowClose] = React.useState(props.showClose ?? false)
  const [index, setIndex] = React.useState(props.index ?? props.snap ?? 0)
  const {theme, colorMode} = React.useContext(YBaseContext)
  const colors = theme.palette[colorMode].colors

  const onCloseRef = React.useRef(null)

  React.useEffect(() => {
    onCloseRef.current = props.onClose ?? null
  }, [props.onClose])

  function closeCallback() {
    if (typeof props.onClose === 'function') {
      props.onClose()
    }
  }

  React.useEffect(() => {
    if (props.isOpen) {
      actionSheet.setCloseCallback(closeCallback)
      actionSheet.setIndex(index)
      actionSheet.setTitle(title)
      actionSheet.setShowClose(showClose)
      actionSheet.setActionSheetBack(colors.surface)
      if (typeof props.children !== 'undefined') {
        actionSheet.setToRender(props.children)
      }
      actionSheet.openBottomSheet(props.onClose)
    }
  }, [props.isOpen])

  /*
  React.useEffect(() => {
    if (typeof props.onClose !== 'undefined' && props.onClose) {
      actionSheet.setOnClose(props.onClose)
    }
  }, [props.onClose])
  React.useEffect(() => {
    const idx = props.index ?? props.height ?? -1
    console.log('setting idx', idx)
    actionSheet.setIndex(idx)
  }, [props.index, props.height])
*/
}

const Item = props => {
  const actionSheet = React.useContext(YBaseContext)

  function HandlePress(theFunc) {
    actionSheet.closeBottomSheet()
    theFunc()
  }
  if (typeof props.onPress !== 'undefined' && props.onPress) {
    return (
      <Pressable
        flex={props.flex}
        borderRadius={props.borderRadius ?? 0}
        borderWidth={props.borderWidth ?? 0}
        bgColor={props.bgColor}
        px={props.px ?? 20}
        mx={props.mx ?? 0}
        onPress={() => HandlePress(props.onPress)}>
        {props.children}
      </Pressable>
    )
  } else {
    return <View px={20}>{props.children}</View>
  }
}

ActionSheet.Item = Item

export {ActionSheet}
