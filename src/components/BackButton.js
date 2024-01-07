import React from 'react'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {Pressable, View, useYBase} from '@ybase'

export const LeftHeader = props => {
  const {colors} = useYBase()
  return (
    <Pressable
      onPress={() => props.navigation.goBack()}
      pressedBackgroundColor={'transparent'}
      defaultBackgroundColor={'transparent'}>
      <View>
        <MCI name="chevron-left" size={25} color={colors.inverseSurface} />
      </View>
    </Pressable>
  )
}
