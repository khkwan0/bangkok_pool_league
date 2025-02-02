import {
  Appearance,
  Image,
  Pressable,
  ScrollView,
  Switch,
  View,
} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import {useTheme, useNavigation} from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import config from '@/app/config.js'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import Feather from '@expo/vector-icons/Feather'
import {useLeagueContext} from '@/context/LeagueContext'
import {useTranslation} from 'react-i18next'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import NavDest from '@/components/NavDest'
import React, {useEffect, useState} from 'react'
import {useColorScheme} from 'react-native'
interface User {
  id: number
  nickname: string
  profile_picture?: string
}

const SectionHeader = ({title}: {title: string}) => {
  const {colors} = useTheme()
  return (
    <View className="mt-6 mb-2 border-b border-gray-600">
      <Text
        className="text-sm uppercase tracking-wider mb-1"
        style={{color: colors.primary}}>
        {title}
      </Text>
    </View>
  )
}

export default function Settings() {
  const {colors, dark} = useTheme()
  const {state, dispatch} = useLeagueContext()
  const [isDark, setIsDark] = useState(useColorScheme() === 'dark')
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const {t} = useTranslation()

  useEffect(() => {
    navigation.setOptions({
      title: t('settings'),
    })
  }, [navigation, t])

  const user = state.user as User

  async function ToggleTheme(value: boolean) {
    try {
      setIsDark(value)
      await AsyncStorage.setItem('theme', value ? 'dark' : 'light')
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    Appearance.setColorScheme(isDark ? 'dark' : 'light')
  }, [isDark])

  async function HandleLogout() {
    try {
      await AsyncStorage.removeItem('jwt')
      dispatch({type: 'DEL_USER'})
    } catch (e) {
      console.error('Error removing token:', e)
    }
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 8,
      }}>
      <View className="flex-1">
        {/* App Info & Theme Section */}
        <View className="bg-gray-800/20 rounded-xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm opacity-75">Build {config.build}</Text>
            <View className="flex-row items-center space-x-2 bg-gray-800/30 rounded-lg p-2">
              <Feather name="sun" color={colors.text} size={18} />
              <Switch
                value={isDark}
                onValueChange={ToggleTheme}
                trackColor={{false: colors.primary, true: colors.primary}}
                thumbColor={colors.text}
              />
              <MCI name="weather-night" color={colors.text} size={18} />
            </View>
          </View>
        </View>

        {/* User Section */}
        {typeof user.id !== 'undefined' && (
          <View className="bg-gray-800/20 rounded-xl p-4 mb-4">
            <View className="flex-row items-center">
              <View className="h-16 w-16 rounded-full bg-gray-700/50 items-center justify-center overflow-hidden">
                {user.profile_picture ? (
                  <Image
                    source={{uri: config.profileUrl + user.profile_picture}}
                    className="h-16 w-16"
                    resizeMode="cover"
                  />
                ) : (
                  <MCI name="account" size={32} color={colors.text} />
                )}
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-lg font-semibold text-right">
                  {user.nickname}
                </Text>
                <Text className="text-sm opacity-60 text-right">
                  ID: {String(user.id)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {(typeof user?.id === 'undefined' || !user.id) && (
          <View className="my-4">
            <NavDest icon="login" text={t('login')} url="/Auth" />
          </View>
        )}

        {/* League Management */}
        <SectionHeader title={t('league_management')} />
        <NavDest
          icon="account-group"
          text={t('teams')}
          url={'/Settings/teams'}
        />
        <NavDest
          icon="chart-areaspline-variant"
          text={t('statistics')}
          url={'/Settings/Stats'}
        />
        <NavDest
          icon="division"
          text={t('divisions')}
          url={'/Settings/Divisions'}
        />
        <NavDest
          icon="leaf-circle-outline"
          text={t('seasons')}
          url={'/Settings/Seasons'}
        />

        {/* Venue & Players */}
        <SectionHeader title={t('people_and_places')} />
        <NavDest
          icon="map-marker"
          text={t('venues')}
          url={'/Settings/Venues'}
        />
        <NavDest
          icon="account-outline"
          text={t('players')}
          url={'/Settings/Players'}
        />

        {/* App Settings */}
        <SectionHeader title={t('app_settings')} />
        <NavDest
          icon="information-outline"
          text={t('info_and_guides')}
          url={'/Settings/Info'}
        />
        <NavDest
          icon="cog"
          text={t('preferences')}
          url={'/Settings/Preferences'}
        />
      </View>

      {/* Logout Section */}
      <View className="mt-auto pb-4" style={{paddingBottom: insets.bottom}}>
        {typeof user?.id !== 'undefined' && user.id && (
          <Pressable
            onPress={HandleLogout}
            className="flex-row items-center py-3 px-4 bg-red-500/10 rounded-lg">
            <MCI name="logout" color="#ef4444" size={24} />
            <Text className="ml-4" style={{color: '#ef4444'}}>
              {t('logout')}
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  )
}
