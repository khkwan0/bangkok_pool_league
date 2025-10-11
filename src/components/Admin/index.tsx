import React from 'react'
import {View} from 'react-native'
import NavDest from '@/components/NavDest'
import {useNavigation} from 'expo-router'
import {useTranslation} from 'react-i18next'

export default function Admin() {
  const navigation = useNavigation()
  const {t} = useTranslation()

  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: t('admin'),
    })
  }, [])

  return (
    <View>
      <NavDest
        icon="email"
        text="Login As Other User"
        url="/Settings/Admin/LoginAsOtherUser"
      />
    </View>
  )
}
