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
  messageCount?: number
}

export default function NavDest(props: NavDestProps) {
  const {colors} = useTheme()
  const router = useRouter()
  const {messageCount = 0, text} = props

  return (
    <Pressable className="my-3" onPress={() => router.push(props.url as any)}>
      <View className="flex-row p-4 items-center">
        <View className="flex-0 w-10 ">
          <MCI name={props.icon} color={colors.text} size={20} />
        </View>
        <View className="flex-auto">
          <Text className="font-bold">{text}</Text>
        </View>
        <View className="flex-auto">
          {messageCount > 0 && (
            <Text className="bg-red-500 rounded-full px-2 mx-24 py-1 text-center text-white">
              {messageCount.toString()}
            </Text>
          )}
        </View>
        <View className="content-end">
          <MCI name="greater-than" color={colors.text} size={20} />
        </View>
      </View>
    </Pressable>
  )
}
