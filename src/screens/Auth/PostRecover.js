import React from 'react'
import {Button, Text, View} from '@ybase'
import {useYBase} from '~/lib/hooks'
import {useTranslations} from 'react-i18next'

const PostRecover = props => {
  const {colors} = useYBase()
  const {t} = useTranslations()
  return (
    <View flex={1} px={20} bgColor={colors.background}>
      <View flex={1} />
      <View flex={4}>
        <Text bold fontSize="xxxl" textAlign="center">succcess</Text>
      </View>
      <View flex={1}>
        <Button>{t('continue')}</Button>
      </View>
    </View>
  )
}

export default PostRecover
