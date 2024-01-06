import React from 'react'
import {View} from './View'
import {YBaseContext} from './YBaseProvider'

const Modal = props => {
  const modal = React.useContext(YBaseContext)

  React.useEffect(() => {
    modal.setModalTitle(props.title)
  }, [props.title])

  function closeCallback() {
    if (typeof props.onModalClose === 'function') {
      props.onModalClose()
    }
  }

  React.useEffect(() => {
    if (props.isOpen) {
      modal.setModalCloseCallback(closeCallback)
      modal.setModalTitle(props.title ?? '')
      modal.setModalShowClose(props.showClose ?? false)
      if (props.children) {
        modal.setModalToRender(props.children)
      }
      modal.openModal()
    } else {
      modal.closeModal()
    }
  }, [props.isOpen])
}

const ModalBody = props => {
  const modal = React.useContext(YBaseContext)
  modal.setModalToRender(props.children)
}

const ModalHeader = props => {
  const modal = React.useContext(YBaseContext)
  console.log('props chielden')
  modal.setModalHeader(props.children)
}

const ModalFooter = props => {
  const modal = React.useContext(YBaseContext)
  modal.setModalFooter(props.children)
  return <View>{props.children}</View>
}

const ModalClose = props => {
  console.log('show cllkose')
  const modal = React.useContext(YBaseContext)
  modal.setModalShowClose(true)
}

const ModalContent = props => {
  const modal = React.useContext(YBaseContext)
  modal.setModalProps(props.children)
}

Modal.Body = ModalBody
Modal.Header = ModalHeader
Modal.Footer = ModalFooter
Modal.CloseButton = ModalClose
Modal.Content = ModalContent

export {Modal}
