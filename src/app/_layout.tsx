import { LeagueProvider } from '@/context/LeagueContext'
import { MatchProvider } from '@/context/MatchContext'
import '@/i18n'
import notifee, { AndroidImportance } from '@notifee/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import messaging, {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  onNotificationOpenedApp,
  requestPermission
} from '@react-native-firebase/messaging'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { useFonts } from 'expo-font'
import { router, Stack } from 'expo-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Appearance,
  ColorSchemeName,
  Linking,
  LogBox,
  PermissionsAndroid,
  Platform,
  useColorScheme
} from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import '../../global.css'

function RootLayout() {
  const {t} = useTranslation()
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  // Suppress SafeAreaView deprecation warning from third-party dependencies
  LogBox.ignoreLogs([
    "SafeAreaView has been deprecated and will be removed in a future release. Please use 'react-native-safe-area-context' instead.",
  ])

  Sentry.init({
    dsn: 'https://16db053ee26e7ad79d1bf8941ec890ba@o4507715036053504.ingest.us.sentry.io/4507715037757440',
    sendDefaultPii: true,
    enableLogs: true,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.mobileReplayIntegration(),
      Sentry.feedbackIntegration(),
    ],
  })

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

  // Handle notification taps
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const messagingInstance = messaging()
      
      // Handle notification taps when app is in background/foreground
      const unsubscribe = onNotificationOpenedApp(messagingInstance, remoteMessage => {
        // console.log('Notification opened app (background/foreground):', JSON.stringify(remoteMessage, null, 2))
        
        // Check for threadId first - if it exists, navigate to message thread
        const threadId = remoteMessage?.data?.threadId || remoteMessage?.data?.rootId
        if (threadId) {
          //console.log('Found threadId, navigating to message thread')
          // Add small delay to ensure router is ready
          setTimeout(() => {
            handleNotificationNavigation(remoteMessage)
          }, 500)
        } else {
          // No threadId, check for link URL
          const url = remoteMessage.data?.link
          if (url) {
            // console.log('No threadId, opening link:', url)
            Linking.openURL(url as string)
          } else {
            // console.log('No threadId or link, attempting navigation anyway')
            setTimeout(() => {
              handleNotificationNavigation(remoteMessage)
            }, 500)
          }
        }
      })

      // Check if app was opened from a notification (quit state)
      getInitialNotification(messagingInstance)
        .then(remoteMessage => {
          // console.log('Initial notification (quit state):', JSON.stringify(remoteMessage, null, 2))
          if (remoteMessage) {
            // Check for threadId first - if it exists, navigate to message thread
            const threadId = remoteMessage?.data?.threadId || remoteMessage?.data?.rootId
            if (threadId) {
              // console.log('Found threadId in initial notification, navigating to message thread')
              // Add delay to ensure router and app are fully initialized
              setTimeout(() => {
                handleNotificationNavigation(remoteMessage)
              }, 1000)
            } else {
              // No threadId, check for link URL
              const url = remoteMessage.data?.link
              if (url) {
                // console.log('No threadId in initial notification, opening link:', url)
                Linking.openURL(url as string)
              } else {
                // console.log('No threadId or link in initial notification, attempting navigation anyway')
                setTimeout(() => {
                  handleNotificationNavigation(remoteMessage)
                }, 1000)
              }
            }
          }
        })
        .catch(error => {
          console.error('Error getting initial notification:', error)
        })

      return unsubscribe
    }
  }, [])

  function handleNotificationNavigation(remoteMessage: any) {
    // Check if user is logged in by checking AsyncStorage for jwt
    AsyncStorage.getItem('jwt')
      .then(jwt => {
        if (!jwt) {
          console.log('User not logged in, skipping navigation')
          return
        }

        try {
          console.log('Handling notification navigation, full remoteMessage:', JSON.stringify(remoteMessage, null, 2))
          
          // Extract thread ID from notification data - check camelCase fields first (from your payload)
          const threadId = remoteMessage?.data?.threadId || 
                          remoteMessage?.data?.rootId ||
                          remoteMessage?.data?.thread_id || 
                          remoteMessage?.data?.root_id || 
                          remoteMessage?.data?.message_id ||
                          remoteMessage?.data?.id ||
                          remoteMessage?.messageId
          
          // Extract sender name from notification
          const from = remoteMessage?.data?.from || 
                       remoteMessage?.data?.sender_nickname || 
                       remoteMessage?.data?.sender_name ||
                       remoteMessage?.notification?.title ||
                       ''

          console.log('Extracted threadId:', threadId, 'from:', from)

          if (threadId) {
            const path = `/Settings/Messages/${threadId}`
            console.log('Navigating to:', path, 'with params:', {from})
            
            // Navigate to the message thread using push to add to stack (provides back button)
            router.push({
              pathname: path as any,
              params: {from: from || ''}
            })
          } else {
            console.warn('No threadId found in notification data. Available data:', remoteMessage?.data)
            console.warn('Full notification object:', remoteMessage)
          }
        } catch (error) {
          console.error('Error handling notification navigation:', error)
        }
      })
      .catch(error => {
        console.error('Error checking jwt:', error)
      })
  }

  return (
    <SafeAreaProvider>
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
              <Stack.Screen
                name="Settings"
                options={{
                  headerShown: false,
                }}
              />
            </Stack>
          </MatchProvider>
        </LeagueProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}

export default Sentry.wrap(RootLayout)
