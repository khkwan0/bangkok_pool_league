import React from 'react'
import {Tabs} from 'expo-router'
import {TabBarIcon} from '@/components/navigation/TabBarIcon'
import {useTranslation} from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import LanguageOption from '@/components/LanguageOption'
import i18n from '@/i18n'
import {View} from 'react-native'

export default function TabLayout() {
  const {t} = useTranslation()
  const [isMounted, setIsMounted] = React.useState(false)
  const [showLanguageOption, setShowLanguageOption] = React.useState(false)

  React.useEffect(() => {
    async function getLanguage() {
      try {
        const lang = await AsyncStorage.getItem('language')
        if (!lang) {
          setShowLanguageOption(true)
        } else {
          await i18n.changeLanguage(lang)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setIsMounted(true)
      }
    }
    getLanguage()
  }, [])

  async function handleLanguageOption(lang: string) {
    try {
      await AsyncStorage.setItem('language', lang)
      await i18n.changeLanguage(lang)
      setShowLanguageOption(false)
    } catch (error) {
      console.log(error)
    }
  }

  if (!isMounted) {
    return null
  }
  if (showLanguageOption) {
    return (
      <View className="flex-1 justify-center mx-4">
        <LanguageOption handleLanguageOption={handleLanguageOption} />
      </View>
    )
  } else {
    return (
      <Tabs>
        <Tabs.Screen
          name="(index)"
          options={{
            headerTitle: t('bangkok_pool_league'),
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabBarIcon
                name={focused ? 'home' : 'home-outline'}
                color={color}
              />
            ),
            tabBarLabel: t('home'),
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            title: t('statistics'),
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabBarIcon
                name={focused ? 'stats-chart' : 'stats-chart-outline'}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="completed"
          options={{
            title: t('completed'),
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabBarIcon
                name={focused ? 'code-slash' : 'code-slash-outline'}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="teams"
          options={{
            title: t('teams'),
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabBarIcon
                name={focused ? 'people' : 'people-outline'}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    )
  }
}
