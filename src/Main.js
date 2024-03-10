import React from 'react'
import Home from '@screens/Home'
import {useAccount, useLeague, useYBase} from '~/lib/hooks'
import '~/i18n'
import {useTranslation} from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {ActivityIndicator, Pressable, Row, Text, View} from '@ybase'
import {AppState} from 'react-native'
import messaging from '@react-native-firebase/messaging'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import {Linking, Platform} from 'react-native'
import notifee, {AndroidImportance} from '@notifee/react-native'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

const NeedUpdate = props => {
  const {colors} = useYBase()
  const [acknowledged, setAcknowledged] = React.useState(false)
  const insets = useSafeAreaInsets()

  async function HandleUpdate() {
    try {
      setAcknowledged(true)
      const url =
        Platform.OS === 'ios'
          ? 'https://apps.apple.com/us/app/bangkok-pool-league/id6447631894'
          : 'https://play.google.com/store/apps/details?id=com.bangkok_pool_league'
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      }
    } catch (e) {
      console.log(e)
    }
  }

  if (!acknowledged && props.needsUpdate) {
    return (
      <Row alignItems="center" pt={insets.top}>
        <View flex={1} />
        <View flex={2}>
          <Pressable
            py={10}
            bgColor={colors.error}
            onPress={() => HandleUpdate()}>
            <Text bold textAlign="center">
              A new version is available.
            </Text>
          </Pressable>
        </View>
        <View flex={1} alignItems="flex-end">
          <Pressable pr={20} onPress={() => setAcknowledged(true)}>
            <MCI name="close" size={20} />
          </Pressable>
        </View>
      </Row>
    )
  } else {
    return null
  }
}
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
      console.log('fetch user')
      await account.FetchUser()
    } catch (e) {
      console.log(e)
    } finally {
      setIsMounted(true)
    }
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

  async function CheckVersion() {
    setNeedsUpdate(await account.CheckVersion())
  }

  React.useEffect(() => {
    CheckVersion()
  }, [])

  if (isMounted) {
    return (
      <View flex={1} bgColor={colors.background}>
        <NeedUpdate needsUpdate={needsUpdate} />
        <Home />
      </View>
    )
  } else {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator />
      </View>
    )
  }

  /*
  if (drawerOnly) {
    return (
      <View style={{flex: 1, paddingTop: insets.top}}>
        <Drawer.Navigator
          drawerContent={params => <DrawerContent {...params} />}
          screenOptions={({navigation}) => ({
            headerStyle: {
              backgroundColor: colors.headerBackground,
            },
            headerTitleStyle: {
              color: colors.onHeaderBackground,
            },
            drawerPosition: 'right',
            headerTitleAlign: 'center',
            headerLeft: () => null,
            headerRight: () => (
              <IconButton icon="menu" onPress={() => navigation.openDrawer()} />
            ),
          })}>
          <Drawer.Screen
            name="Matches"
            component={Matches}
            options={{headerShown: false}}
          />
          <Drawer.Screen name="Login" component={Login} />
          <Drawer.Screen name="Divisions" component={Divisions} />
          <Drawer.Screen
            name="Venues"
            component={Venues}
            options={{headerShown: false}}
          />
          <Drawer.Screen
            name="Teams"
            component={Teams}
            options={{headerShown: false}}
          />
          <Drawer.Screen
            name="Players"
            component={Players}
            options={{headerShown: false}}
          />
          <Drawer.Screen name="Calendar" component={Calendar} />
          <Drawer.Screen name="Schedules" component={Schedules} />
          <Drawer.Screen name="Seasons" component={Seasons} />
          <Drawer.Screen
            name="Statistics"
            component={Statistics}
            options={{headerShown: false}}
          />
          <Drawer.Screen name="Info" component={Info} />
          <Drawer.Screen
            name="Settings"
            component={Settings}
            options={{headerTitle: t('settings')}}
          />
        </Drawer.Navigator>
      </View>
    )
  } else {
    return (
      <Tab.Navigator
        screenOptions={{
          lazy: false,
          headerShown: false,
        }}>
        <Tab.Screen
          name="Matches"
          component={Matches}
          options={{
            tabBarLabel: 'Matches',
            tabBarIcon: ({color, size}) => {
              return (
                <MaterialCommunityIcons
                  name="billiards-rack"
                  size={size}
                  color={color}
                />
              )
            },
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={Calendar}
          options={{
            tabBarIcon: ({color, size}) => {
              return (
                <MaterialCommunityIcons
                  name="calendar"
                  size={size}
                  color={color}
                />
              )
            },
          }}
        />
        <Tab.Screen
          name="Me"
          component={Account}
          options={{
            tabBarIcon: ({color, size}) => {
              return (
                <MaterialCommunityIcons
                  name="head-dots-horizontal"
                  size={size}
                  color={color}
                />
              )
            },
          }}
        />
      </Tab.Navigator>
    )
  }
    */
}

export default Main
