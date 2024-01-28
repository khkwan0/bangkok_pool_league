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

const App = () => {
  React.useEffect(() => {
    ;(async () => {
      await BootSplash.hide({fade: true})
    })()
  }, [])

  async function RequestUserPermission() {
    const authStatus = await messaging().requestPermission()
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      messaging.AuthorizationStatus.PROVISIONAL
    if (enabled) {
      console.log('Authorization status: ', authStatus)
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

export default App
