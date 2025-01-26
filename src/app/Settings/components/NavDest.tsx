import React from 'react'
import {ThemedText as Text} from '@/components/ThemedText'
import {Pressable, View} from 'react-native'
import {Href, Link} from 'expo-router'
import {useTheme} from '@react-navigation/native'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'

interface NavDestProps {
  url: Href<string | object>
  text: string
  icon: any
}

export default function NavDest(props: NavDestProps) {
  const {colors} = useTheme()

  return (
    <Link href={props.url} asChild>
      <Pressable className="my-3">
        <View className="flex-row">
          <View className="flex-0 w-10">
            <MCI name={props.icon} color={colors.text} size={20} />
          </View>
          <View className="flex-auto">
            <Text className="font-bold">{props.text}</Text>
          </View>
          <View className="content-end">
            <MCI name="greater-than" color={colors.text} size={20} />
          </View>
        </View>
      </Pressable>
    </Link>
  )
}
