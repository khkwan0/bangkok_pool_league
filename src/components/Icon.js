import React from 'react'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'

const Icon = ({as, name, size, color}) => {
  const _size = size ?? 30
  const _color = color ?? '#000'
  if (
    (typeof as !== 'undefined' && as === 'MaterialCommunityIcons') ||
    typeof as === 'undefined' ||
    !as
  ) {
    return <MCI name={name} size={_size} color={_color} />
  } else if (as === 'Ionicons') {
    return <Ionicons name={name} size={_size} color={_color} />
  }
}

export default Icon
