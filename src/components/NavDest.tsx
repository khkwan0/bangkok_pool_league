import React from 'react'
import {ThemedText as Text} from '@/components/ThemedText'
import {Pressable} from 'react-native'
import {useTheme} from '@react-navigation/native'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import {ThemedView as View} from '@/components/ThemedView'
import {useRouter} from 'expo-router'
interface NavDestProps {
  url: string
  text: string
  icon: any
}

export default function NavDest(props: NavDestProps) {
  const {colors} = useTheme()
  const router = useRouter()

  return (
    <Pressable
      className="my-3"
      onPress={() => router.push({pathname: props.url})}>
      <View className="flex-row p-4">
        <View className="flex-0 w-10 ">
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
  )
}
