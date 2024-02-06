import React from 'react'
import {IconButton} from 'react-native-paper'
import {useNavigation} from '@react-navigation/native'
import {useYBase} from '~/lib/hooks'

const SettingsIcon = props => {
  const {colors} = useYBase()
  const navigation = useNavigation()
  return (
    <IconButton
      icon="menu"
      onPress={() => navigation.navigate('Settings')}
      iconColor={colors.onSurface}
    />
  )
}

export default SettingsIcon
