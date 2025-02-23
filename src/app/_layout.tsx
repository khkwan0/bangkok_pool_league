import {LeagueProvider} from '@/context/LeagueContext'
import * as SplashScreen from 'expo-splash-screen'
import {useFonts} from 'expo-font'
import {useEffect} from 'react'
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
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import notifee, {AndroidImportance} from '@notifee/react-native'
import {SettingsButton} from '@/components/navigation/SettingsButton'
import {useTranslation} from 'react-i18next'
import {getAccountUsername} from 'expo/config'
import {useAccount} from '@/hooks/useAccount'

export default function RootLayout() {
  const {t} = useTranslation()
  const colorScheme = useColorScheme()
  const account = useAccount()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
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
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      if (Platform.OS === 'ios') {
        try {
          const count = await account.GetUnreadMessageCount()
          PushNotificationIOS.setApplicationIconBadgeNumber(count)
        } catch (e) {
          console.log(e)
        }
      } else {
      }
    })
  }, [])

  useEffect(() => {
    ;(async () => {
      const savedColorScheme = await AsyncStorage.getItem('theme')
      if (!savedColorScheme) {
        Appearance.setColorScheme(null)
      } else {
        Appearance.setColorScheme(savedColorScheme as ColorSchemeName)
      }
    })()
  }, [])

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      if (Platform.OS === 'ios') {
        try {
          const count = await account.GetUnreadMessageCount()
          PushNotificationIOS.setApplicationIconBadgeNumber(count)
        } catch (e) {
          console.log(e)
        }
      }
    })
    return unsubscribe
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
