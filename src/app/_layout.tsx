import {LeagueProvider} from '@/context/LeagueContext'
import * as SplashScreen from 'expo-splash-screen'
import {useFonts} from 'expo-font'
import React, {useEffect} from 'react'
import {MatchProvider} from '@/context/MatchContext'
import {Stack} from 'expo-router'
import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native'
import {
  Appearance,
  useColorScheme,
  PermissionsAndroid,
  Platform,
  ColorSchemeName,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import '@/i18n'
import '../../global.css'
import messaging from '@react-native-firebase/messaging'
import notifee, {AndroidImportance} from '@notifee/react-native'
import {useTranslation} from 'react-i18next'
import * as Sentry from '@sentry/react-native'

function RootLayout() {
  const {t} = useTranslation()
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  Sentry.init({
    dsn: 'https://16db053ee26e7ad79d1bf8941ec890ba@o4507715036053504.ingest.us.sentry.io/4507715037757440',
    tracesSampleRate: 1.0,
    _experiments: {
      profilesSampleRate: 1.0,
    },
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  async function RequestUserPermission() {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission()
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        messaging.AuthorizationStatus.PROVISIONAL
      if (enabled) {
        console.log('Authorization status: ', authStatus)
      }
    } else if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      )
    }
  }

  useEffect(() => {
    RequestUserPermission()
  }, [])

  useEffect(() => {
    if (Platform.OS !== 'web') {
      ;(async () => {
        const savedColorScheme = await AsyncStorage.getItem('theme')
        if (!savedColorScheme) {
        Appearance.setColorScheme(null)
      } else {
          Appearance.setColorScheme(savedColorScheme as ColorSchemeName)
        }
      })()
    }
  }, [])

  async function CreateChannel() {
    await notifee.createChannel({
      id: 'App Wide',
      name: 'General',
      vibration: true,
      lights: true,
      importance: AndroidImportance.HIGH,
    })
  }

  useEffect(() => {
    CreateChannel()
  }, [])

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LeagueProvider>
        <MatchProvider>
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{
                headerTitle: t('bangkok_pool_league'),
                headerShown: false,
              }}
            />
          </Stack>
        </MatchProvider>
      </LeagueProvider>
    </ThemeProvider>
  )
}

export default Sentry.wrap(RootLayout)
