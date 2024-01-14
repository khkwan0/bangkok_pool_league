import React from 'react'
import {Button, Text, View} from '@ybase'
import {useYBase} from '~/lib/hooks'

const PostRecover = props => {
  const {colors} = useYBase()
  return (
    <View flex={1} px={20} bgColor={colors.background}>
      <View flex={1} />
      <View flex={4}>
        <Text>succcess</Text>
      </View>
      <View flex={1}>
        <Text>continue</Text>
      </View>
    </View>
  )
}

export default PostRecover
