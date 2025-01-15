import {Appearance, Pressable, ScrollView, Switch, View} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import {useTheme} from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import config from '@/app/config.js'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import Feather from '@expo/vector-icons/Feather'
import {useLeagueContext} from '@/context/LeagueContext'
import {useTranslation} from 'react-i18next'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import NavDest from './components/NavDest'
import {Href} from 'expo-router'

export default function Settings() {
  const {colors, dark} = useTheme()
  const {state, dispatch} = useLeagueContext()
  const insets = useSafeAreaInsets()
  const {t} = useTranslation()

  const user = state.user

  async function ToggleTheme() {
    try {
      const newTheme = dark ? 'light' : 'dark'
      Appearance.setColorScheme(newTheme)
      await AsyncStorage.setItem('theme', newTheme)
    } catch (e) {
      console.log(e)
    }
  }

  function HandleLogout() {
    console.log('handle logout')
    dispatch({type: 'DEL_USER'})
  }

  return (
    <ScrollView className="mx-8" contentContainerStyle={{flexGrow: 1}}>
      <View className="flex-1">
        <View className="flex-row mt-4 items-center">
          <View className="flex-1">
            <Text>Build {config.build}</Text>
          </View>
          <View className="flex-1 flex-row items-center justify-end">
            <Feather name="sun" color={colors.text} size={20} />
            <Switch
              value={dark}
              onChange={() => ToggleTheme()}
              trackColor={{false: colors.text, true: colors.text}}
            />
            <MCI name="weather-night" color={colors.text} size={20} />
          </View>
        </View>
        {typeof user.id !== 'undefined' && (
          <View>
            <Text>{user.nickname}</Text>
            <Text>{user.id}</Text>
          </View>
        )}
        {(typeof user?.id === 'undefined' || !user.id) && (
          <View className="mt-10">
            <NavDest icon="login" text={t('login')} url="/Auth" />
          </View>
        )}
        <NavDest icon="account-group" text={t('teams')} url={("/Settings/Teams") as Href} />
        <NavDest
          icon="chart-areaspline-variant"
          text={t('statistics')}
          url={("/Settings/Stats") as Href}
        />
        <NavDest
          icon="division"
          text={t('divisions')}
          url={("/Settings/Divisions") as Href}
        />
        <NavDest
          icon="leaf-circle-outline"
          text={t('seasons')}
          url={("/Settings/Seasons") as Href}
        />
        <NavDest icon="map-marker" text={t('venues')} url={("/Settings/Venues") as Href} />
        <NavDest
          icon="account-outline"
          text={t('players')}
          url={("/Settings/Players") as Href}
        />
        <NavDest
          icon="information-outline"
          text={t('info_and_guides')}
          url={("/Settings/Info") as Href}
        />
        <NavDest
          icon="cog"
          text={t('preferences')}
          url={("/Settings/Preferences") as Href}
        />
      </View>
      <View
        className="flex-1 justify-end"
        style={{paddingBottom: insets.bottom}}>
        {typeof user?.id !== 'undefined' && user.id && (
          <Pressable onPress={() => HandleLogout()}>
            <View className="flex-row items-center gap-20">
              <MCI name="logout" color={colors.text} size={30} />
              <Text>{t('logout')}</Text>
            </View>
          </Pressable>
        )}
      </View>
    </ScrollView>
  )
}
