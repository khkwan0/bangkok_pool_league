import {Pressable, View} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import {useTranslation} from 'react-i18next'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import {useTheme} from '@react-navigation/native'
import {router} from 'expo-router'
import React from 'react'
import {useNavigation} from 'expo-router'

export default function Preferences() {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const navigation = useNavigation()

  function HandlePress(route: string) {
    router.push(route as any)
  }

  React.useEffect(() => {
    navigation.setOptions({title: t('preferences')})
  }, [t])

  return (
    <View className="flex-1 p-4" style={{backgroundColor: colors.background}}>
      <View className="mb-6">
        <View className="mb-2">
          <Text
            className="text-sm font-semibold opacity-70"
            style={{color: colors.text}}>
            {t('general')}
          </Text>
        </View>
        <View
          className="rounded-xl overflow-hidden shadow-sm"
          style={{backgroundColor: colors.card}}>
          <Pressable
            className="border-b"
            style={{borderColor: colors.border}}
            onPress={() => HandlePress('/Settings/Preferences/Language')}>
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <MCI name="translate" size={24} color={colors.text} />
                <Text className="text-base" style={{color: colors.text}}>
                  {t('language_in_english')}/{t('language_in_thai')}
                </Text>
              </View>
              <MCI name="chevron-right" size={24} color={colors.text} />
            </View>
          </Pressable>

          <Pressable
            className="border-b"
            style={{borderColor: colors.border}}
            onPress={() => HandlePress('/Settings/Preferences/Notifications')}>
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <MCI name="bell-outline" size={24} color={colors.text} />
                <Text className="text-base" style={{color: colors.text}}>
                  {t('notification')}
                </Text>
              </View>
              <MCI name="chevron-right" size={24} color={colors.text} />
            </View>
          </Pressable>
        </View>
      </View>

      <View className="mb-6">
        <View className="mb-2">
          <Text
            className="text-sm font-semibold opacity-70"
            style={{color: colors.text}}>
            {t('account')}
          </Text>
        </View>
        <View
          className="rounded-xl overflow-hidden shadow-sm"
          style={{backgroundColor: colors.card}}>
          <Pressable
            className="border-b"
            style={{borderColor: colors.border}}
            onPress={() => HandlePress('/Settings/Preferences/Security')}>
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <MCI name="shield-outline" size={24} color={colors.text} />
                <Text className="text-base" style={{color: colors.text}}>
                  {t('security')}
                </Text>
              </View>
              <MCI name="chevron-right" size={24} color={colors.text} />
            </View>
          </Pressable>

          <Pressable
            className="border-b"
            style={{borderColor: colors.border}}
            onPress={() => HandlePress('/Settings/Preferences/Profile')}>
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <MCI name="account-outline" size={24} color={colors.text} />
                <Text className="text-base" style={{color: colors.text}}>
                  {t('profile')}
                </Text>
              </View>
              <MCI name="chevron-right" size={24} color={colors.text} />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
