import React from 'react'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import NavDest from '@/components/NavDest'

export default function Admin() {
  return (
    <View>
      <NavDest
        icon="email"
        text="Login As Other User"
        url="/Settings/Admin/LoginAsOtherUser"
      />
    </View>
  )
}
