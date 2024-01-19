import React from 'react'
import {Text, View} from '@ybase'
import {useYBase} from '~/lib/hooks'
import {useSelector} from 'react-redux'

const Player = props => {
  const {colors} = useYBase()
  const user = useSelector(_state => _state.userData).user
  console.log(user)

  React.useEffect(() => {
    props.navigation.setOptions({
      headerTitle: user.nickname,
    })
  }, [])

  return (
    <View flex={1} bgColor={colors.background} px={20}>
    </View>
  )
}

export default Player

