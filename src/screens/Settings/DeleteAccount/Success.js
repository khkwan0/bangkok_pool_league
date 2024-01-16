import React from 'react'
import {Button, Text, View} from '@ybase'
import {useAccount, useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'

const DeleteAccountSuccess = props => {
  const {colors} = useYBase()
  const {t} = useTranslation()
  const account = useAccount()

  React.useEffect(() => {
    props.navigation.setOptions({
      headerBackVisible: false,
      headerLeft: null,
      gestureEnabled: false,
    })
    const unsubscribe = props.navigation.addListener('beforeRemove', e => {
      if (e.data.action.type === 'NAVIGATE') {
        props.navigation.dispatch(e.data.action)
      }
      e.preventDefault()
    })
    return () => unsubscribe()
  }, [])

  async function HandleContinue() {
    await account.Logout(false)
    props.navigation.navigate('Settings')
  }

  return (
    <View flex={1} px={20} bgColor={colors.background}>
      <View flex={1} />
      <View flex={2}>
        <View alignItems="center">
          <MCI name="check-circle" color={colors.success} size={60} />
        </View>
        <Text bold textAlign="center" fontSize="xxxl">
          success
        </Text>
      </View>
      <View flex={1}>
        <Button onPress={() => HandleContinue()}>{t('continue')}</Button>
      </View>
    </View>
  )
}

export default DeleteAccountSuccess
