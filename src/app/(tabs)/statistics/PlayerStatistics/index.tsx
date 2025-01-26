import {ThemedView as View} from '@/components/ThemedView'
import React from 'react'
import {useNavigation} from '@react-navigation/native'
import {useTranslation} from 'react-i18next'

export default function PlayerStatistics(props: any) {
  const navigation = useNavigation()
  const {t} = useTranslation()

  React.useEffect(() => {
    navigation.setOptions({
      title: t('player_statistics'),
    })
  }, [navigation])

  return <View></View>
}
