import React, {useState} from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import CustomTextInput from '@/components/TextInput'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import {useTranslation} from 'react-i18next'
import {useRouter} from 'expo-router'

export default function RegisterScreen() {
  const {t} = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async () => {
    setError('')
    setLoading(true)

    try {
      if (!email || !password || !confirmPassword) {
        setError(t('invalid_parameters'))
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError(t('invalid_email'))
        return
      }

      if (password.length < 6) {
        setError(t('password_minimum_length', {n: 6}))
        return
      }

      if (password !== confirmPassword) {
        setError(t('password_mismatch'))
        return
      }

      // TODO: Implement actual registration logic here
      console.log('Registration data:', {email, password})
    } catch (err) {
      setError(t('server_error'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.mainContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('@/assets/logo.png')}
              style={styles.headerImage}
              resizeMode="contain"
            />
            <Text type="title" style={styles.headerText}>
              {t('create_account')}
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('email')}</Text>
              <CustomTextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t('email_placeholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                leftIcon={MaterialCommunityIcons}
                leftIconProps={{name: 'email-outline'}}
                iconSize={22}
                error={!!error && !email}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('password')}</Text>
              <CustomTextInput
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
                iconSize={22}
                error={!!error && !password}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('confirm_password')}</Text>
              <CustomTextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t('password_placeholder')}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password"
                leftIcon={MaterialCommunityIcons}
                leftIconProps={{name: 'lock-outline'}}
                rightIcon={MaterialCommunityIcons}
                rightIconProps={{
                  name: showConfirmPassword ? 'eye-off-outline' : 'eye-outline',
                }}
                onRightIconPress={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                iconSize={22}
                error={!!error && !confirmPassword}
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              style={styles.registerButton}>
              <Text style={styles.registerButtonText}>
                {loading ? t('loading') : t('register')}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.loginButton}>
              <Text style={styles.loginButtonText}>{t('login')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  mainContainer: {
    flex: 1,
    padding: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  headerImage: {
    width: 96,
    height: 96,
    marginBottom: 24,
  },
  headerText: {
    textAlign: 'center',
    fontSize: 30,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 32,
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    gap: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    color: '#9CA3AF',
    fontWeight: '600',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  registerButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  registerButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loginButtonText: {
    color: '#2563eb',
    fontWeight: '500',
  },
})
