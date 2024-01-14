import React from 'react'
import {Button, Row, Text, View} from '@ybase'
import {useYBase} from '~/lib/hooks'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

const NewSeasonSuccess = props => {
  const insets = useSafeAreaInsets()
  const {colors} = useYBase()

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('beforeRemove', e => {
      if (e.data.action.type === 'NAVIGATE') {
        props.navigation.dispatch(e.data.action)
      }
      e.preventDefault()
    })
    return () => unsubscribe()
  }, [props.navigation])

  return (
    <View flex={1} bgColor={colors.background} px={20}>
      <View flex={1} />
      <View flex={4}>
        <Text>success</Text>
      </View>
      <View flex={1} pb={Math.max(insets.bottom, 20)} alignItems="flex-end">
        <Button onPress={() => props.navigation.navigate('admin_seasons_new')}>ok</Button>
      </View>
    </View>
  )
}

export default NewSeasonSuccess
