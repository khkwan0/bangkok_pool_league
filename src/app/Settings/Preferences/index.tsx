import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {useTheme, useNavigation} from '@react-navigation/native'
import {useTranslation} from 'react-i18next'
import {Pressable} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import i18n from '@/i18n'
import {useEffect, useState} from 'react'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'

export default function Preferences() {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const navigation = useNavigation()
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language)

  useEffect(() => {
    navigation.setOptions({
      title: t('preferences'),
    })
  }, [navigation, t])

  useEffect(() => {
    // Load saved language on mount
    AsyncStorage.getItem('language').then(lang => {
      if (lang) setCurrentLanguage(lang)
    })
  }, [])

  const changeLanguage = async (lang: string) => {
    try {
      await i18n.changeLanguage(lang)
      await AsyncStorage.setItem('language', lang)
      setCurrentLanguage(lang)
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  return (
    <View className="flex-1 p-4">
      <View className="bg-gray-800/20 rounded-xl p-4">
        <Text className="text-lg font-semibold mb-4">{t('language')}</Text>
        <View className="space-y-2">
          <Pressable
            onPress={() => changeLanguage('en')}
            className={`p-3 rounded-lg ${
              currentLanguage === 'en' ? 'bg-primary/20' : 'bg-gray-700/20'
            }`}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text
                  style={{
                    color:
                      currentLanguage === 'en' ? colors.primary : colors.text,
                  }}>
                  {t('english_in_english')}
                </Text>
                <Text
                  className="text-sm opacity-60"
                  style={{
                    color:
                      currentLanguage === 'en' ? colors.primary : colors.text,
                  }}>
                  {t('english_in_thai')}
                </Text>
              </View>
              {currentLanguage === 'en' && (
                <MCI name="check" size={20} color={colors.primary} />
              )}
            </View>
          </Pressable>
          <Pressable
            onPress={() => changeLanguage('th')}
            className={`p-3 rounded-lg ${
              currentLanguage === 'th' ? 'bg-primary/20' : 'bg-gray-700/20'
            }`}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text
                  style={{
                    color:
                      currentLanguage === 'th' ? colors.primary : colors.text,
                  }}>
                  {t('thai_in_thai')}
                </Text>
                <Text
                  className="text-sm opacity-60"
                  style={{
                    color:
                      currentLanguage === 'th' ? colors.primary : colors.text,
                  }}>
                  {t('thai_in_english')}
                </Text>
              </View>
              {currentLanguage === 'th' && (
                <MCI name="check" size={20} color={colors.primary} />
              )}
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
