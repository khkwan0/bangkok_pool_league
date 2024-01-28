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
import config from './src/config'
import {LogLevel, OneSignal} from 'react-native-onesignal'

const App = () => {
  React.useEffect(() => {
    ;(async () => {
      await BootSplash.hide({fade: true})
    })()
  }, [])

  React.useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose)
    OneSignal.initialize(config.ONESIGNAL_APP_ID)
    OneSignal.Notifications.requestPermission(true)
    OneSignal.Notifications.addEventListener('click', e => {
      console.log(e)
    })
    OneSignal.Notifications.addEventListener('permissionChange', granted => {})
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

export default App
