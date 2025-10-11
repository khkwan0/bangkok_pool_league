import {WebView} from 'react-native-webview'

export default function PrivacyPolicy() {
  return (
    <WebView
      source={{uri: 'https://bkkleague.com/privacy'}}
      style={{flex: 1}}
    />
  )
}
