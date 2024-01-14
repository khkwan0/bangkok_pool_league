import React from 'react'
import {WebView} from 'react-native-webview'

const PrivacyPolicy = props => {
  return (
    <WebView
      source={{uri: 'https://bkkleague.com/privacy'}}
      style={{flex: 1}}
    />
  )
}

export default PrivacyPolicy
