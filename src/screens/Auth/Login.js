import React from 'react'
import {Image} from 'react-native'
import Logo from '~/assets/img/logos/512_trans.png'
import {Button, Pressable, Row, Text, TextInput, View} from '@ybase'
import {useAccount, useYBase} from '~/lib/hooks'
import LineLogin from '@xmartlabs/react-native-line'
import LineSuccess from './LineSuccess'
import {Settings, LoginManager, AccessToken} from 'react-native-fbsdk-next'
/*
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin'
*/
import {useSelector} from 'react-redux'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useTranslation} from 'react-i18next'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

const Login = props => {
  const {SocialLogin, UserLogin, Logout} = useAccount()
  const {user} = useSelector(_state => _state.userData)
  const [email, setEmail] = React.useState('')
  const [secure, setSecure] = React.useState(true)
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [showSocial, setShowSocial] = React.useState(false)
  const [lineSuccess, setLineSuccess] = React.useState(false)
  const [err, setErr] = React.useState('')
  const {colors, theme, colorMode} = useYBase()
  const {t} = useTranslation()
  const insets = useSafeAreaInsets()

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
        setLineSuccess(true)
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

  if (lineSuccess) {
    return <LineSuccess />
  } else {
    return (
      <>
        {typeof user.data?.nickname !== 'undefined' && user.data.nickname && (
          <View flex={1} px={20} bgColor={colors.background}>
            <Text>You are logged in as: {user.data.nickname}</Text>
            <Button onPress={() => HandleLogout()}>Logout</Button>
          </View>
        )}
        {(typeof user.data?.nickname === 'undefined' ||
          !user.data.nickname) && (
          <View flex={1} bgColor={colors.background} px={20}>
            <View flex={1} mt={20}>
              <Text bold textAlign="center" fontSize="xxl">
                Bangkok Pool League
              </Text>
              {colorMode === 'light' && (
                <View>
                  <Image source={Logo} />
                </View>
              )}
            </View>
            <View flex={10}>
              <View>
                <View>
                  <Button
                    variant="ghost"
                    onPress={() => setShowSocial(s => !s)}>
                    {t('social_login')}
                  </Button>
                </View>
                {showSocial && (
                  <View>
                    <View mx={40}>
                      <Button onPress={() => HandleFacebookLogin()}>
                        Facebook
                      </Button>
                    </View>
                    <View mx={40} mt={10}>
                      <Pressable
                        onPress={() => HandleLineLogin()}
                        borderRadius={theme.roundness}
                        bgColor="#06c755"
                        py={10}>
                        <Row alignItems="center" space={30}>
                          <View flex={1} pl={10}>
                            <Image
                              source={require('~/assets/social/line/btn_base.png')}
                            />
                          </View>
                          <View flex={2} alignItems="center">
                            <Text bold color="#fff" fontSize="xl">
                              Line
                            </Text>
                          </View>
                          <View flex={1} />
                        </Row>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
              <View mt={20}>
                <TextInput
                  autoCapitalize="none"
                  placeholder={t('email')}
                  value={email}
                  inputLeftElement={
                    <View ml={10}>
                      <MCI name="email" size={30} color={colors.onSurface} />
                    </View>
                  }
                  onChangeText={text => setEmail(text)}
                />
              </View>
              <View mt={20}>
                <TextInput
                  secureTextEntry={secure}
                  autoCapitalize="none"
                  placeholder={t('password')}
                  value={password}
                  inputLeftElement={
                    <View ml={10}>
                      <MCI name="lock" size={30} color={colors.onSurface} />
                    </View>
                  }
                  inputRightElement={
                    <Pressable onPress={() => setSecure(s => !s)} pr={10}>
                      <MCI
                        name={secure ? 'eye-outline' : 'eye-off-outline'}
                        size={30}
                        color={colors.onSurface}
                      />
                    </Pressable>
                  }
                  onChangeText={text => setPassword(text)}
                />
              </View>
              <View mt={20}>
                <View>
                  <Button
                    loading={loading}
                    disabled={loading}
                    onPress={() => AttemptLogin()}>
                    {t('login')}
                  </Button>
                </View>
              </View>
              <View>
                <Button
                  variant="ghost"
                  onPress={() => props.navigation.navigate('RegisterPart1')}>
                  {t('sign_up')}
                </Button>
              </View>
            </View>
            <View flex={1} pb={insets.bottom}>
              <Button
                onPress={() => props.navigation.navigate('Recover')}
                variant="ghost">
                {t('forgot_password')}
              </Button>
            </View>
          </View>
        )}
      </>
    )
  }
}

export default Login
