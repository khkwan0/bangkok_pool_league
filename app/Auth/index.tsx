import React, {useEffect} from 'react'
import {Image, Pressable, View} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import {router, useNavigation} from 'expo-router'
import LineLogin from '@khkwan0/react-native-line'
import {useAccount} from '@/hooks'

interface StatusType {
  status: string
}

export default function AuthHome() {
  const [err, setErr] = React.useState('')
  const [lineSuccess, setLineSuccess] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const {SocialLogin, UserLogin, Logout} = useAccount()
  const [disabledLoginButton, setDisabledLoginButton] = React.useState(false)

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
  return (
    <View>
      <Pressable disabled={disabledLoginButton} onPress={() => HandleLineLogin()} className="bg-[#06c755] rounded-lg mx-10">
        <View className="flex-row items-center p-2">
          <View className="flex-none w-2">
            <Image source={require('@/assets/social/line/btn_base.png')} />
          </View>
          <View className="flex-1">
            <Text className="text-center">Line</Text>
          </View>
        </View>
      </Pressable>
    </View>
  )
}
