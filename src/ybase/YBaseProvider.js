import React from 'react'
import BottomSheet from '@gorhom/bottom-sheet'
import {PixelRatio, Pressable, useWindowDimensions} from 'react-native'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {Text} from './Text'
import {View} from './View'
import {Divider} from './Divider'
import {ToolTipFramework} from './ToolTipFramework'
import {ModalFramework} from './ModalFramework'
import {ScrollView} from './ScrollView'
import {RightHeader} from '../components/RightHeader'

export const YBaseContext = React.createContext(null)

function Normalize(size, based = 'width', heightBaseScale, widthBaseScale) {
  const newSize =
    based === 'height' ? size * heightBaseScale : size * widthBaseScale
  return Math.round(PixelRatio.roundToNearestPixel(newSize))
}

export const YBaseProvider = props => {
  const [theme, setTheme] = React.useState({...props.theme})
  const [colorMode, setColorMode] = React.useState('dark')

  const {width, height} = useWindowDimensions()

  const WidthBaseScale = React.useMemo(() => {
    return width / 375
  }, [])

  const HeightBaseScale = React.useMemo(() => {
    return height / 812
  }, [])

  const HeightScale = React.useCallback(
    size => Normalize(size, 'height', WidthBaseScale, HeightBaseScale),
    [],
  )

  const WidthScale = React.useCallback(
    size => Normalize(size, 'width', WidthBaseScale, HeightBaseScale),
    [],
  )

  // tooltip states
  const [toolTipIsOpen, setToolTipIsOpen] = React.useState(false)
  const [toolTipPressableHeight, setToolTipPressableHeight] = React.useState(0)
  const [pressedY, setPressedY] = React.useState(0)
  const [pressedX, setPressedX] = React.useState(0)
  const [toolTipBackgroundColor, setToolTipBackgroundColor] = React.useState()
  const [toolTipRoundness, setToolTipRoundness] = React.useState(0)
  const [toolTipTitle, setToolTipTitle] = React.useState('')
  const [tip, setTip] = React.useState('')
  const [closeTooltipCallBack, setCloseTooltipCallback] = React.useState(null)

  // bottom sheet states
  const [snapPoints, setSnapPoints] = React.useState(['30%', '50%', '75%'])
  const [index, setIndex] = React.useState(-1)
  const [toRender, setToRender] = React.useState(null)
  const [title, setTitle] = React.useState('')
  const [showClose, setShowClose] = React.useState(false)
  const [actionSheetBack, setActionSheetBack] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const [closeCallBack, setCloseCallback] = React.useState(null)

  // bottom sheet refs
  const bottomSheetRef = React.useRef()

  // modal states
  const [modalIsOpen, setModalIsOpen] = React.useState(false)
  const [modalFooter, setModalFooter] = React.useState('')
  const [modalBody, setModalBody] = React.useState(null)
  const [modalShowClose, setModalShowClose] = React.useState(false)
  const [modalProps, setModalProps] = React.useState({})
  const [modalCloseCallback, setModalCloseCallback] = React.useState(() => {})
  const [modalToRender, setModalToRender] = React.useState(null)
  const [modalTitle, setModalTitle] = React.useState('')

  const SetColorMode = React.useCallback((mode = 'light') => {
    setColorMode(mode)
  }, [])

  // bottom sheet handlers
  function OpenBottomSheet() {
    setIsOpen(true)
    bottomSheetRef.current.snapToIndex(index)
  }

  function CloseBottomSheet() {
    if (typeof closeCallBack === 'function') {
      closeCallBack()
    }
    setIsOpen(false)
    bottomSheetRef.current.close()
  }

  function CloseModal() {
    if (typeof modalCloseCallback === 'function') {
      modalCloseCallback()
    }
    setModalIsOpen(false)
  }

  return (
    <YBaseContext.Provider
      value={{
        theme: theme,
        colorMode: colorMode,
        openBottomSheet: OpenBottomSheet,
        closeBottomSheet: CloseBottomSheet,
        setColorMode: val => SetColorMode(val),
        setToRender: setToRender,
        setShowClose: setShowClose,
        setActionSheetBack: setActionSheetBack,
        setTitle: setTitle,
        setIndex: setIndex,
        setCloseCallback: setCloseCallback,

        // tool tip
        openToolTip: () => setToolTipIsOpen(true),
        closeToolTip: () => setToolTipIsOpen(false),
        setPressableHeight: setToolTipPressableHeight,
        setPressedY: setPressedY,
        setPressedX: setPressedX,
        setToolTipBackgroundColor: setToolTipBackgroundColor,
        setToolTipRoundness: setToolTipRoundness,
        setToolTipTitle: setToolTipTitle,
        setTip: setTip,

        // modal
        openModal: () => setModalIsOpen(true),
        closeModal: () => setModalIsOpen(false),
        setModalBody: setModalBody,
        setModalFooter: setModalFooter,
        setModalShowClose: setModalShowClose,
        setModalProps: setModalProps,
        setModalCloseCallback: setModalCloseCallback,
        setModalToRender: setModalToRender,
        setModalTitle: setModalTitle,

        // normalization
        HeightScale,
      }}>
      {props.children}
      {isOpen && (
        <Pressable
          style={{
            position: 'absolute',
            backgroundColor: '#000000aa',
            width: width,
            height: height,
          }}
          onPress={() => {
            CloseBottomSheet()
          }}
        />
      )}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={index}
        backgroundComponent={null}>
        <View
          style={{
            position: 'absolute',
            backgroundColor: actionSheetBack,
            width: width,
            height: height,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 20,
              paddingLeft: 20,
              paddingRight: 20,
              backgroundColor: actionSheetBack,
            }}>
            <Text bold fontSize="md">
              {title}
            </Text>
            {showClose && <RightHeader onclose={() => CloseBottomSheet()} />}
          </View>
          {title && <Divider />}

          {isOpen && (
            <ScrollView>
              <View>{toRender}</View>
            </ScrollView>
          )}
        </View>
      </BottomSheet>
      <ToolTipFramework
        isOpen={toolTipIsOpen}
        onClose={() => setToolTipIsOpen(false)}
        theme={theme}
        toolTipPressableHeight={toolTipPressableHeight}
        pressedY={pressedY}
        pressedX={pressedX}
        backgroundColor={toolTipBackgroundColor}
        roundness={toolTipRoundness}
        title={toolTipTitle}
        tip={tip}
      />
      <ModalFramework
        theme={theme}
        colorMode={colorMode}
        isOpen={modalIsOpen}
        title={modalTitle}
        closeModal={CloseModal}
        modalBody={modalBody}
        modalFooter={modalFooter}
        modalShowClose={modalShowClose}
        modalProps={modalProps}
        toRender={modalToRender}
      />
    </YBaseContext.Provider>
  )
}
