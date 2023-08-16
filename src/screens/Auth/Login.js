import React from 'react'
import {View} from 'react-native'
import {Button, Text, TextInput} from 'react-native-paper'
import {useAccount} from '~/lib/hooks'
import LineLogin from '@xmartlabs/react-native-line'
import {Settings, LoginManager, AccessToken} from 'react-native-fbsdk-next'
/*
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin'
*/
import {useAppSelector} from '~/lib/hooks/redux'

const Login = props => {
  const {SocialLogin, UserLogin, Logout} = useAccount()
  const {user} = useAppSelector(_state => _state.user)
  const [email, setEmail] = React.useState('')
  const [secure, setSecure] = React.useState(true)
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [showSocial, setShowSocial] = React.useState(false)
  const [err, setErr] = React.useState('')

  React.useEffect(() => {
    Settings.initializeSDK()
    /*
    AccessToken.getCurrentAccessToken().then(accessToken => {
      console.log('fbtoken', accessToken)
    })
    */
    /*
    GoogleSignin.configure({
      webClientId:
        '498946945828-1sk1rjvia7gthtro5lp7jjie5l4dct6i.apps.googleusercontent.com',
    })
    */
  }, [])

  async function HandleFacebookLogin() {
    const res = await LoginManager.logInWithPermissions(['public_profile'])
    if (res.isCancelled) {
      console.log('cancelled')
    }
    const data = await AccessToken.getCurrentAccessToken()
    if (!data) {
      console.log('no data')
    } else {
        const res = await SocialLogin('facebook', data)
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          if (typeof props.route.params?.previous !== 'undefined') {
            props.navigation.navigate(props.route?.params?.previous)
          } else {
            props.navigation.goBack()
          }
        }
    }
  }
  /*
  async function HandleGoogleLogin() {
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true})
      const res = await GoogleSignin.signIn()
      console.log(res)
    } catch (e) {
      console.log(e)
    }
  }
  */

  async function AttemptLogin() {
    try {
      setErr('')
      setLoading(true)
      const res = await UserLogin(email, password)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        if (typeof props.route.params?.previous !== 'undefined') {
          props.navigation.navigate(props.route?.params?.previous)
        } else {
          props.navigation.goBack()
        }
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  async function HandleLineLogin() {
    try {
      setErr('')
      const lineRes = await LineLogin.login({nonce: Date.now()})
      if (typeof lineRes.accessToken !== 'undefined') {
        const res = await SocialLogin('line', lineRes)
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          if (typeof props.route.params?.previous !== 'undefined') {
            props.navigation.navigate(props.route?.params?.previous)
          } else {
            props.navigation.goBack()
          }
        }
      }
    } catch (e) {
      setErr('Unable to Login')
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  async function HandleLogout() {
    try {
      await Logout()
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <View style={{flex: 1}}>
      {typeof user.data?.nickname !== 'undefined' && user.data.nickname && (
        <View>
          <Text>You are logged in as: {user.data.nickname}</Text>
          <Button onPress={() => HandleLogout()}>Logout</Button>
        </View>
      )}
      {(typeof user.data?.nickname === 'undefined' || !user.data.nickname) && (
        <>
          <View style={{flex: 2, justifyContent: 'center'}}>
            <View>
              <TextInput
                label="Email"
                value={email}
                left={<TextInput.Icon icon="email" />}
                onChangeText={text => setEmail(text)}
              />
            </View>
            <View>
              <TextInput
                secureTextEntry={secure}
                label="Password"
                value={password}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={secure ? 'eye' : 'eye-off'}
                    onPress={() => setSecure(s => !s)}
                  />
                }
                onChangeText={text => setPassword(text)}
              />
            </View>
            <View>
              <View>
                <Button
                  mode="contained"
                  loading={loading}
                  disabled={loading}
                  onPress={() => AttemptLogin()}>
                  Login
                </Button>
              </View>
            </View>
          </View>
          <View style={{flex: 1.5, justifyContent: 'flex-start'}}>
            <View style={{marginBottom: 30}}>
              <Button onPress={() => setShowSocial(s => !s)}>
                Social Login
              </Button>
            </View>
            {showSocial && (
              <View stlye={{paddingTop: 10}}>
                <View>
                  <Button onPress={() => HandleFacebookLogin()}>
                    Facebook
                  </Button>
                </View>
                <View>
                  <Button onPress={() => HandleLineLogin()}>Line</Button>
                </View>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  )
}

export default Login
