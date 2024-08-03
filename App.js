import 'react-native-gesture-handler'
import React from 'react'
import {YBaseProvider} from './src/ybase/YBaseProvider'
import store from './src/redux/store'
import {Provider} from 'react-redux'
import {NavigationContainer, DefaultTheme} from '@react-navigation/native'
import {MD3LightTheme, Provider as PaperProvider} from 'react-native-paper'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {theme} from './src/assets/theme'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import BootSplash from 'react-native-bootsplash'
import Main from './src/Main'
import messaging from '@react-native-firebase/messaging'
import {PermissionsAndroid, Platform} from 'react-native'
import * as Sentry from '@sentry/react-native'

Sentry.init({
  dsn: 'https://16db053ee26e7ad79d1bf8941ec890ba@o4507715036053504.ingest.us.sentry.io/4507715037757440',
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
  _experiments: {
    // profilesSampleRate is relative to tracesSampleRate.
    // Here, we'll capture profiles for 100% of transactions.
    profilesSampleRate: 1.0,
  },
})

const App = () => {
  React.useEffect(() => {
    ;(async () => {
      await BootSplash.hide({fade: true})
    })()
  }, [])

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

  React.useEffect(() => {
    RequestUserPermission()
  }, [])

  const linking = {
    prefixes: ['https://api.bkkleague.com', 'bkkleague://'],
  }

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <NavigationContainer linking={linking} theme={DefaultTheme}>
            <PaperProvider theme={MD3LightTheme}>
              <YBaseProvider theme={theme}>
                <Main />
              </YBaseProvider>
            </PaperProvider>
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  )
}

export default Sentry.wrap(App)
