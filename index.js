/**
 * @format
 */

import {AppRegistry} from 'react-native'
import App from './App'
import {name as appName} from './app.json'
import messaging from '@react-native-firebase/messaging'
import PushNotificationIOS from '@react-native-community/push-notification-ios'

messaging().setBackgroundMessageHandler(async remoteMessage => {
  PushNotificationIOS.setApplicationIconBadgeNumber(
    remoteMessage.notification.ios.badge,
  )
})

AppRegistry.registerComponent(appName, () => App)
