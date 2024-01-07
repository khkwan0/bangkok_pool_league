import React from 'react'
import {Text, View} from '@ybase'
import {useYBase} from '~/lib/hooks'

const Divisions = props => {
  const {colors} = useYBase()

  return (
    <View flex={1} bgColor={colors.background} px={20}>
      <Text bold>coming_soon</Text>
    </View>
  )
}

export default Divisions
