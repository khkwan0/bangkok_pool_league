import React from 'react'
import {Button, Pressable, ScrollView, Text, TextInput, View} from '@ybase'
import {useAccount, useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'

const Register = props => {
  const {colors} = useYBase()
  const [err, setErr] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [password2, setPassword2] = React.useState('')
  const [showPassword1, setShowPassword1] = React.useState(true)
  const [showPassword2, setShowPassword2] = React.useState(true)
  const [valid, setValid] = React.useState(false)
  const [loading, setIsLoading] = React.useState(false)
  const {t} = useTranslation()
  const account = useAccount()

  async function HandleRegister() {
    try {
      setIsLoading(true)
      const res = await account.Register(email, password, password2)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        props.navigation.navigate('Register Success')
      } else {
        setErr(res.error)
      }
    } catch (e) {
      setErr(t('server_error') + ' - ' + t('please_contact_support'))
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    setErr('')
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
    const validEmail = email.match(regex) ? true : false
    if (password && password2 && password === password2 && validEmail) {
      setValid(true)
    } else {
      setValid(false)
    }
    if (!validEmail && email) {
      setErr('invalid_email')
    } else {
      if (password.length > 0 && password.length < 7) {
        setErr(t('password_minimum_length', {n: '6'}))
      } else if (password !== password2) {
        setErr(t('password_mismatch'))
      }
    }
  }, [password, password2, email])

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 20,
      }}>
      <View flex={1}>
        <View mt={20}>
          <Text textAlign="center" bold fontSize="xxl">
            Bangkok Pool League
          </Text>
        </View>
        <View mt={20}>
          <Text bold fontSize="lg">
            create_account
          </Text>
        </View>
      </View>
      <View flex={3} gap={20}>
        <View>
          <TextInput
            keyboardType="email-address"
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
        <View>
          <TextInput
            secureTextEntry={showPassword1}
            autoCapitalize="none"
            placeholder={t('password')}
            value={password}
            inputLeftElement={
              <View ml={10}>
                <MCI name="lock" size={30} color={colors.onSurface} />
              </View>
            }
            inputRightElement={
              <Pressable onPress={() => setShowPassword1(s => !s)} pr={10}>
                <MCI
                  name={showPassword1 ? 'eye-outline' : 'eye-off-outline'}
                  size={30}
                  color={colors.onSurface}
                />
              </Pressable>
            }
            onChangeText={text => setPassword(text)}
          />
        </View>
        <View>
          <TextInput
            secureTextEntry={showPassword1}
            autoCapitalize="none"
            placeholder={t('confirm_password')}
            value={password2}
            inputLeftElement={
              <View ml={10}>
                <MCI name="lock" size={30} color={colors.onSurface} />
              </View>
            }
            inputRightElement={
              <Pressable onPress={() => setShowPassword2(s => !s)} pr={10}>
                <MCI
                  name={showPassword2 ? 'eye-outline' : 'eye-off-outline'}
                  size={30}
                  color={colors.onSurface}
                />
              </Pressable>
            }
            onChangeText={text => setPassword2(text)}
          />
        </View>
      </View>
      <View flex={1}>
        {err && (
          <View>
            <Text color={colors.error}>{err}</Text>
          </View>
        )}
        <Button
          loading={loading}
          disabled={!valid}
          onPress={() => HandleRegister()}>
          {t('sign_up')}
        </Button>
      </View>
    </ScrollView>
  )
}

export default Register
