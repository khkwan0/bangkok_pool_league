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
export default function RootLayout() {
  const colorScheme = useColorScheme()

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
    } else {
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
      console.log(remoteMessage)

      if (Platform.OS === 'ios') {
        PushNotificationIOS.setApplicationIconBadgeNumber(
          remoteMessage.notification.ios.badge,
        )
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
      console.log(JSON.stringify(remoteMessage, null, 2))
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
            <Stack.Screen name="(tabs)" options={{headerShown: false}} />
          </Stack>
        </MatchProvider>
      </LeagueProvider>
    </ThemeProvider>
  )
}
