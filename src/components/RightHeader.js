import React from 'react'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {Pressable, View, useYBase} from '@ybase'

export const RightHeader = props => {
  const {colors} = useYBase()
  return (
    <Pressable
      pressedBackgroundColor={'transparent'}
      defaultBackgroundColor={'transparent'}
      onPress={() =>
        props.onclose ? props.onclose() : props.navigation.goBack()
      }>
      <View style={{alignItems: 'center'}}>
        <MCI name="close" size={25} color={colors.inverseSurface} />
      </View>
    </Pressable>
  )
}
