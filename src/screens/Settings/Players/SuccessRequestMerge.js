import React from 'react'
import {Button, Text, View} from '@ybase'
import {useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'

const SuccessRequestMerge = props => {
  const {t} = useTranslation()
  const {colors} = useYBase()

  React.useEffect(() => {
    props.navigation.setOptions({
      headerBackVisible: false,
      headerLeft: null,
      gestureEnabled: false,
    })
    props.navigation.addListener('beforeRemove', e => {
      if (e.data.action.type === 'NAVIGATE') {
        props.navigation.dispatch(e.data.action)
      } else {
        e.preventDefault()
      }
    })
  }, [])

  return (
    <View flex={1} bgColor={colors.background} px={20}>
      <View flex={1} />
      <View flex={2}>
        <Text bold color={colors.success} textAlign="center" fontSize="xxxl">
          request_submitted
        </Text>
      </View>
      <View flex={1}>
        <Button onPress={() => props.navigation.navigate('Root')}>
          {t('continue')}
        </Button>
      </View>
    </View>
  )
}

export default SuccessRequestMerge
