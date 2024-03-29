import React from 'react'
import {Button, Pressable, Text, TextInput, View} from '@ybase'
import {useAccount, useYBase} from '~/lib/hooks'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useTranslation} from 'react-i18next'

const RecoverVerify = props => {
  const {colors} = useYBase()
  const [loading, setLoading] = React.useState(false)
  const [valid, setValid] = React.useState(false)
  const [err, setErr] = React.useState('')
  const [recoverCode, setRecoverCode] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [password2, setPassword2] = React.useState('')
  const [showPassword1, setShowPassword1] = React.useState(true)
  const [showPassword2, setShowPassword2] = React.useState(true)
  const account = useAccount()
  const {t} = useTranslation()

  async function HandleVerify() {
    try {
      if (recoverCode && recoverCode.length > 5) {
        if (password.length > 5) {
          if (password === password2) {
            setLoading(true)
            const res = await account.Verify(recoverCode, password, password2)
            if (typeof res.status !== 'undefined' && res.status === 'ok') {
              props.navigation.navigate('Post Recover')
            } else {
              setErr(t(res.error))
            }
          } else {
            setErr(t('password_mismatch'))
          }
        } else {
          setErr(t('password_length', {n: 6}))
        }
      } else {
        setErr(t('invalid_code'))
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (password.length > 5) {
      if (password === password2) {
        setValid(true)
      }
    }
  }, [password, password2])

  return (
    <View flex={1} bgColor={colors.background} px={20}>
      <View flex={2} mt={20}>
        <View>
          <Text bold fontSize="xxl">
            {t('check_email_for_code', {email: props.route.params.email})}
          </Text>
        </View>
        <View mt={20}>
          <TextInput
            autoCapitalize="characters"
            placeholder={t('verification_code')}
            value={recoverCode}
            inputLeftElement={
              <View ml={10}>
                <MCI name="code-string" size={30} color={colors.onSurface} />
              </View>
            }
            onChangeText={text => setRecoverCode(text)}
          />
        </View>
        <View mt={20}>
          <TextInput
            secureTextEntry={showPassword1}
            autoCapitalize="none"
            placeholder={t('new_password')}
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
        <View mt={20}>
          <TextInput
            secureTextEntry={showPassword2}
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
        <View mt={30}>{err && <Text color={colors.error}>{err}</Text>}</View>
      </View>
      <View flex={1}>
        <Button
          loading={loading}
          disabled={!valid}
          onPress={() => HandleVerify()}>
          {t('verify')}
        </Button>
      </View>
    </View>
  )
}

export default RecoverVerify
