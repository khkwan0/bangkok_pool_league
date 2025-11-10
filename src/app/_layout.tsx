import {LeagueProvider} from '@/context/LeagueContext'
import {MatchProvider} from '@/context/MatchContext'
import '@/i18n'
import notifee, {AndroidImportance} from '@notifee/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {AuthorizationStatus, getMessaging, requestPermission} from '@react-native-firebase/messaging'
import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import {useFonts} from 'expo-font'
import {Stack} from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {
  Appearance,
  ColorSchemeName,
  PermissionsAndroid,
  Platform,
  useColorScheme,
} from 'react-native'
import '../../global.css'

function RootLayout() {
  const {t} = useTranslation()
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  Sentry.init({
    dsn: 'https://16db053ee26e7ad79d1bf8941ec890ba@o4507715036053504.ingest.us.sentry.io/4507715037757440',
    sendDefaultPii: true,
    enableLogs: true,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
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
      const messaging = getMessaging()
      const authStatus = await requestPermission(messaging)
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        AuthorizationStatus.PROVISIONAL
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
