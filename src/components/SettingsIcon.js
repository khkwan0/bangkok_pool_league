import React from 'react'
import {IconButton} from 'react-native-paper'
import {useNavigation} from '@react-navigation/native'

const SettingsIcon = props => {
  const navigation = useNavigation()
  return (
    <IconButton icon="menu" onPress={() => navigation.navigate('Settings')} />
  )
}

export default SettingsIcon
