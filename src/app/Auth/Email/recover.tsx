import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native'
import {useTranslation} from 'react-i18next'
import {useAccount} from '@/hooks'
import React from 'react'
import Button from '@/components/Button'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import {useNavigation} from 'expo-router'
import TextInput from '@/components/TextInput'

export default function Recover() {
  const {t} = useTranslation()
  const navigation = useNavigation()
  const [email, setEmail] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const {Recover} = useAccount()
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [])

  React.useEffect(() => {
    navigation.setOptions({
      title: t('forgot_password'),
    })
  }, [navigation, t])

  async function handleRecover() {
    try {
      setError('')
      setLoading(true)
      if (!email) {
        setError(t('invalid_parameters'))
        return
      }

      const res = await Recover(email)
      if (res?.status === 'ok') {
        setSuccess(true)
      } else {
        setError(res?.error ? t(res.error) : t('server_error'))
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
      <ScrollView
        className="flex-1 bg-white dark:bg-gray-900"
        contentContainerStyle={{flexGrow: 1}}>
        <Animated.View style={{opacity: fadeAnim}} className="flex-1 p-6 pt-12">
          {/* Header */}
          <View className="mb-12">
            <Text className="text-center text-gray-600 dark:text-gray-400 text-lg">
              {t('enter_email_for_recovery')}
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-red-100 dark:bg-red-900/30 px-6 py-4 rounded-xl mb-6 border border-red-200 dark:border-red-800">
              <Text className="text-red-600 dark:text-red-400 text-center font-medium">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Success Message */}
          {success ? (
            <View className="bg-green-100 dark:bg-green-900/30 px-6 py-4 rounded-xl mb-6 border border-green-200 dark:border-green-800">
              <Text className="text-green-600 dark:text-green-400 text-center font-medium">
                {t('check_email_for_code', {email})}
              </Text>
            </View>
          ) : null}

          <View className="space-y-6">
            {/* Email Input */}
            <View>
              <Text className="mb-2 text-gray-700 dark:text-gray-300 font-medium text-base">
                {t('email')}
              </Text>
              <View className="relative">
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('email_placeholder')}
                  autoCapitalize="none"
                  autoComplete="email"
                  leftIcon={MaterialCommunityIcons}
                  leftIconProps={{name: 'email-outline'}}
                  iconSize={22}
                  keyboardType="email-address"
                  error={!!error && !email}
                />
              </View>
            </View>

            {/* Recover Button */}
            <Button
              onPress={handleRecover}
              disabled={loading || success}
              className={`${
                loading || success
                  ? 'bg-blue-400'
                  : 'bg-blue-600 active:bg-blue-700'
              } py-4 rounded-lg my-6 shadow-lg text-center`}>
              <Text
                style={{
                  color: '#ffffff',
                  textAlign: 'center',
                  fontSize: 18,
                  fontWeight: '600',
                }}>
                {loading ? t('loading') : t('recover')}
              </Text>
            </Button>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
} 