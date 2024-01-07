import React from 'react'
import {Button, Text, TextInput, View} from '@ybase'
import {useYBase} from '~/lib/hooks'

const Register = props => {
  const {colors} = useYBase()

  return (
    <View flex={1} bgColor={colors.background}>

    </View>
  )
}

export default Register
