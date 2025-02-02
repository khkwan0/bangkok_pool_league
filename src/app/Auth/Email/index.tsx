import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native'
import {useTranslation} from 'react-i18next'
import {useAccount} from '@/hooks'
import {router} from 'expo-router'
import React from 'react'
import Button from '@/components/Button'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import {useNavigation} from '@react-navigation/native'
import TextInput from '@/components/TextInput'

export default function Email() {
  const {t} = useTranslation()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const {UserLogin} = useAccount()
  const navigation = useNavigation()

  React.useEffect(() => {
    navigation.setOptions({
      title: t('email_login'),
    })
  }, [navigation, t])

  async function handleLogin() {
    try {
      setError('')
      setLoading(true)
      if (!email || !password) {
        setError(t('invalid_parameters'))
        return
      }

      const res = await UserLogin(email, password)
      if (res?.status === 'ok') {
        router.back()
      } else {
        setError(t('invalid_creds'))
      }
    } catch (e) {
      setError(t('server_error'))
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1">
      <ScrollView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 p-6">
          {/* Header */}
          <View className="mb-8">
            <Text type="title" className="text-center text-3xl mb-2">
              {t('login')}
            </Text>
            <Text className="text-center text-gray-600 dark:text-gray-400">
              {t('sign_in_to_access')}
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-red-100 dark:bg-red-900/30 px-4 py-3 rounded-lg mb-6">
              <Text className="text-red-600 dark:text-red-400 text-center">
                {error}
              </Text>
            </View>
          ) : null}

          <View className="space-y-8">
            {/* Email Input */}
            <View className="my-6">
              <Text className="mb-2 text-gray-700 dark:text-gray-300">
                {t('email')}
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t('email_placeholder')}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                leftIcon={MaterialCommunityIcons}
                leftIconProps={{name: 'email-outline'}}
                iconSize={20}
                iconColor="#6b7280"
                containerStyle={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: 8,
                }}
                inputStyle={{
                  backgroundColor: '#f3f4f6',
                  borderWidth: 0,
                  height: 48,
                  paddingLeft: 44,
                }}
              />
            </View>

            {/* Password Input */}
            <View className="my-6">
              <Text className="mb-2 text-gray-700 dark:text-gray-300">
                {t('password')}
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t('password_placeholder')}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                leftIcon={MaterialCommunityIcons}
                leftIconProps={{name: 'lock-outline'}}
                rightIcon={MaterialCommunityIcons}
                rightIconProps={{
                  name: showPassword ? 'eye-off-outline' : 'eye-outline',
                }}
                onRightIconPress={() => setShowPassword(!showPassword)}
                iconSize={20}
                iconColor="#6b7280"
                containerStyle={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: 8,
                }}
                inputStyle={{
                  backgroundColor: '#f3f4f6',
                  borderWidth: 0,
                  height: 48,
                  paddingLeft: 44,
                  paddingRight: 44,
                }}
              />
            </View>

            {/* Forgot Password Link */}
            <Pressable
              onPress={() => router.push({pathname: '/Auth/Email/recover'})}
              className="items-end py-2">
              <Text className="text-blue-600 dark:text-blue-400">
                {t('forgot_password')}
              </Text>
            </Pressable>

            {/* Login Button */}
            <Button
              onPress={handleLogin}
              disabled={loading}
              className="bg-blue-600 active:bg-blue-700 py-4 rounded-lg items-center mt-4">
              <Text className="text-white text-center text-lg font-semibold">
                {loading ? t('loading') : t('login')}
              </Text>
            </Button>

            {/* Register Link */}
            <Pressable
              onPress={() => router.push({pathname: '/Auth/Email/register'})}
              className="items-center py-4">
              <Text className="text-blue-600 dark:text-blue-400">
                {t('dont_have_account')} <Text className="font-semibold">{t('register')}</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
