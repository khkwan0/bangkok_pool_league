import React from 'react'
import {Text, View} from 'react-native'

const TeamCard = (props: any) => {
  return (
    <View>
      <Text>{props.team.name}</Text>
    </View>
  )
}

export default TeamCard
