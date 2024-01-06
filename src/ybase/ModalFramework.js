import React from 'react'
import {useWindowDimensions} from 'react-native'
import {Divider} from './Divider'
import {View} from './View'
import {Pressable} from './Pressable'
import {Row} from './Row'
import {Text} from './Text'
import {YBaseContext} from './YBaseProvider'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'

export const ModalFramework = props => {
  const theme = props.theme
  const colorMode = props.colorMode
  const {width, height} = useWindowDimensions()
  const modal = React.useContext(YBaseContext)

  if (props.isOpen) {
    return (
      <View
        position="absolute"
        top={0}
        left={0}
        width={width}
        height={height}
        bgColor="#000000aa"
        zIndex={10}
        style={props.modalProps}>
        <View
          flex={1}
          bgColor={theme.palette[colorMode].colors.background}
          mx={20}
          my={150}
          borderRadius={theme.roundness}>
          <Row p={20} alignItems="center">
            <View flex={1}>
              <Text bold>{props?.title ?? ''}</Text>
            </View>
            {props.modalShowClose && (
              <View flex={1} alignItems="flex-end">
                <Pressable
                  p={20}
                  onPress={() => {
                    props.closeModal()
                  }}>
                  <MCI name="close" size={30} />
                </Pressable>
              </View>
            )}
          </Row>
          <Divider />
          <View>{props.toRender}</View>
        </View>
      </View>
    )
  } else {
    return null
  }
}
