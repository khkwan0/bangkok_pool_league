import React from 'react'
import {Button, Text, View} from '@ybase'
import {useYBase} from '~/lib/hooks'

const RegisterSuccess = props => {
  const {colors} = useYBase()

  return (
    <View flex={1} px={20} bgColor={colors.background}>
      <View flex={1} />
      <View flex={3}>
        <Text bold fontSize="xxxl">
          congratulations
        </Text>
        <Text bold fontSize="xxl">
          successfully_registered
        </Text>
      </View>
      <View flex={1}>
        <Button onPress={() => props.navigation.navigate('Matches')}>ok</Button>
      </View>
    </View>
  )
}

export default RegisterSuccess
