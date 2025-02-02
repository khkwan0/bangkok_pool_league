import React, {useEffect} from 'react'
import {Dimensions, Image, Pressable, ScrollView, View} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import {router} from 'expo-router'
import LineLogin from '@khkwan0/react-native-line'
import {useAccount} from '@/hooks'
import {LoginManager, AccessToken} from 'react-native-fbsdk-next'
import {useTranslation} from 'react-i18next'
import {useNavigation} from '@react-navigation/native'
import {
  AppleButton,
  appleAuth,
} from '@invertase/react-native-apple-authentication'
import {Platform, useColorScheme} from 'react-native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

interface StatusType {
  status: string
  error?: string
}

export default function AuthHome() {
  const [err, setErr] = React.useState('')
  const [lineSuccess, setLineSuccess] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const {SocialLogin, UserLogin, Logout} = useAccount()
  const [disabledLoginButton, setDisabledLoginButton] = React.useState(false)
  const colorScheme = useColorScheme()
  const width = Dimensions.get('window').width
  const {t} = useTranslation()
  const navigation = useNavigation()

  useEffect(() => {
    navigation.setOptions({
      title: t('authorization'),
    })
  }, [navigation, t])

  async function HandleLineLogin() {
    try {
      setErr('')
      setDisabledLoginButton(true)
      const lineRes = await LineLogin.login({nonce: Date.now()})
      if (typeof lineRes.accessToken !== 'undefined') {
        setLineSuccess(true)
        const res: StatusType = (await SocialLogin('line', lineRes))!
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          router.back()
        }
      }
    } catch (e) {
      setErr('Unable to Login')
    } finally {
      setLoading(false)
      setDisabledLoginButton(false)
    }
  }

  async function HandleFacebookLogin() {
    try {
      setErr('')
      setDisabledLoginButton(true)
      const result = await LoginManager.logInWithPermissions(['public_profile'])
      if (result.isCancelled) {
        throw new Error('User cancelled login')
      }
      const data = await AccessToken.getCurrentAccessToken()
      if (data) {
        const res: StatusType = (await SocialLogin('facebook', data))!
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          router.back()
        }
      }
    } catch (e) {
      setErr('Unable to Login')
    } finally {
      setLoading(false)
      setDisabledLoginButton(false)
    }
  }

  async function HandleAppleSignIn() {
    try {
      // performs login request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        // Note: it appears putting FULL_NAME first is important, see issue #293
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      })

      // get current authentication state for user
      // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user,
      )

      // use credentialState response to ensure the user is authenticated
      if (credentialState === appleAuth.State.AUTHORIZED) {
        const res: StatusType = (await SocialLogin(
          'apple',
          appleAuthRequestResponse,
        ))!
        if (typeof res?.status !== 'undefined' && res?.status === 'ok') {
          router.back()
        } else {
          if (typeof res?.status !== 'undefined' && res?.status === 'error') {
            setErr(res?.error ?? 'Unable to Login')
          }
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 justify-center items-center my-16">
        <Image
          source={require('@/assets/logo.png')}
          className="w-32 h-32 mb-8"
          resizeMode="contain"
        />
        <Text type="title" className="text-center text-2xl mb-2">
          Bangkok Pool League
        </Text>
        <Text className="text-center text-gray-600 dark:text-gray-400 mb-12">
          Sign in to access your account
        </Text>

        {err ? (
          <View className="bg-red-100 dark:bg-red-900/30 px-6 py-4 rounded-xl mb-6 border border-red-200 dark:border-red-800">
            <Text className="text-red-600 dark:text-red-400 text-center font-medium">
              {err}
            </Text>
          </View>
        ) : null}

        <View className="w-full px-6 space-y-4 my-4">
          <Pressable
            disabled={disabledLoginButton}
            onPress={() => HandleLineLogin()}
            className="bg-[#06c755] rounded-[8px] overflow-hidden my-1">
            <View className="flex-row items-center justify-center h-[48px] px-4">
              <Image
                source={require('@/assets/social/line/btn_base.png')}
                className="w-6 h-6"
                style={{marginRight: 12}}
              />
              <Text className="text-white font-medium text-[16px]">
                Continue with Line
              </Text>
            </View>
          </Pressable>

          <Pressable
            disabled={disabledLoginButton}
            onPress={() => HandleFacebookLogin()}
            className="bg-[#1877f2] rounded-[8px] overflow-hidden my-1">
            <View className="flex-row items-center justify-center h-[48px] px-4">
              <Image
                source={require('@/assets/social/facebook/icon.png')}
                className="w-6 h-6"
                style={{marginRight: 12}}
              />
              <Text className="text-white font-medium text-[16px]">
                Continue with Facebook
              </Text>
            </View>
          </Pressable>

          {Platform.OS !== 'android' && (
            <View className="my-1">
              <AppleButton
                buttonStyle={
                  colorScheme === 'dark'
                    ? AppleButton.Style.WHITE
                    : AppleButton.Style.BLACK
                }
                buttonType={AppleButton.Type.SIGN_IN}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 12,
                }}
                onPress={() => HandleAppleSignIn()}
              />
            </View>
          )}

          <Pressable
            onPress={() => router.push('/Auth/Email')}
            className="bg-gray-100 dark:bg-gray-800 rounded-[8px] overflow-hidden my-1">
            <View className="flex-row items-center justify-center h-[48px] px-4">
              <MaterialCommunityIcons
                name="email-outline"
                size={24}
                style={{marginRight: 12}}
                color={colorScheme === 'dark' ? '#fff' : '#000'}
              />
              <Text className="font-medium text-[16px] text-gray-900 dark:text-white">
                Continue with Email
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}
