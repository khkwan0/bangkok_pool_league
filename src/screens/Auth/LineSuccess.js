import React from 'react'
import {Text, View} from '@ybase'
import {useYBase} from '~/lib/hooks'

const LineSuccess = props => {
  const {colors} = useYBase()

  return (
    <View flex={1} bgColor={colors.background} px={20}>
      <View flex={1} />
      <View flex={3}>
        <Text>success</Text>
      </View>
    </View>
  )
}

export default LineSuccess
