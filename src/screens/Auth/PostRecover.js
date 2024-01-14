import React from 'react'
import {Button, Text, View} from '@ybase'
import {useYBase} from '~/lib/hooks'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useTranslation} from 'react-i18next'

const PostRecover = props => {
  const {colors} = useYBase()
  const {t} = useTranslation()
  return (
    <View flex={1} px={20} bgColor={colors.background}>
      <View flex={1} />
      <View flex={4}>
        <Text bold fontSize="xxl" textAlign="center">
          password_reset
        </Text>
        <View alignItems="center">
          <MCI name="check-circle" color={colors.green['500']} size={120} />
        </View>
        <Text bold fontSize="xxxl" textAlign="center">
          success
        </Text>
      </View>
      <View flex={1}>
        <Button onPress={() => props.navigation.navigate('Login')}>{t('continue')}</Button>
      </View>
    </View>
  )
}

export default PostRecover
