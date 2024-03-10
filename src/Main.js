import React from 'react'
import Home from '@screens/Home'
import {useAccount, useLeague, useYBase} from '~/lib/hooks'
import '~/i18n'
import {useTranslation} from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {ActivityIndicator, View} from '@ybase'
import {AppState} from 'react-native'
import messaging from '@react-native-firebase/messaging'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import {Linking, Platform} from 'react-native'
import notifee, {AndroidImportance} from '@notifee/react-native'
import {FAB} from 'react-native-paper'

const Main = props => {
  const account = useAccount()
  const league = useLeague()
  const [isMounted, setIsMounted] = React.useState(false)
  const {i18n} = useTranslation()
  const {colors, setColorMode} = useYBase()
  const [needsUpdate, setNeedsUpdate] = React.useState(false)

  const appState = React.useRef(AppState.currentState)

  React.useEffect(() => {
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

  async function FetchUser() {
    try {
      await account.FetchUser()
    } catch (e) {
      console.log(e)
    } finally {
      setIsMounted(true)
    }
  }

  async function CheckVersion() {
    setNeedsUpdate(await account.CheckVersion())
  }

  React.useEffect(() => {
    FetchUser()
  }, [])

  React.useEffect(() => {
    ;(async () => {
      const season = await league.GetSeason()
    })()
  }, [league])

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/background|active/) &&
        nextAppState === 'active'
      ) {
        CheckVersion()
        FetchUser()
      }
      appState.current = nextAppState
    })
    return () => subscription.remove()
  }, [])

  React.useEffect(() => {
    ;(async () => {
      try {
        const lang = await AsyncStorage.getItem('language')
        i18n.changeLanguage(lang ? lang : 'en')
        const storedColorMode = (await AsyncStorage.getItem('theme')) ?? 'light'
        setColorMode(storedColorMode)
      } catch (e) {
        console.log(e)
      }
    })()
    return () => setIsMounted(false)
  }, [])

  React.useEffect(() => {
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

  React.useEffect(() => {
    CreateChannel()
  }, [])

  React.useEffect(() => {
    CheckVersion()
  }, [])

  async function HandleUpdate() {
    try {
      const url =
        Platform.OS === 'ios'
          ? 'https://apps.apple.com/app/bangkok-pool-league/id6447631894'
          : 'https://play.google.com/store/apps/details?id=com.bangkok_pool_league'
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      }
    } catch (e) {
      console.log(e)
    }
  }

  if (isMounted) {
    return (
      <View flex={1} bgColor={colors.background}>
        <Home />
        {needsUpdate && (
          <FAB
            label="An update is available"
            onPress={() => HandleUpdate()}
            icon="update"
          />
        )}
      </View>
    )
  } else {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator />
      </View>
    )
  }
}

export default Main
