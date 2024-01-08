import React from 'react'
import {Button, Text, TextInput, View} from '@ybase'
import {useAccount, useYBase} from '~/lib/hooks'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useTranslation} from 'react-i18next'

const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g

const Recover = props => {
  const {colors} = useYBase()
  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [valid, setValid] = React.useState(false)
  const account = useAccount()
  const {t} = useTranslation()

  async function HandleRecover() {
    try {
      setLoading(true)
      const res = await account
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    const validEmail = email.match(regex) ? true : false
    if (validEmail) {
      setValid(true)
    } else {
      setValid(false)
    }
  }, [email])

  return (
    <View flex={1} bgColor={colors.background} px={20}>
      <View flex={1} mt={20}>
        <View>
          <Text bold fontSize="xxl">
            forgot_password
          </Text>
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
      </View>
      <View flex={1}>
        <Button
          loading={loading}
          disabled={!valid}
          onPress={() => HandleRecover()}>
          {t('recover')}
        </Button>
      </View>
    </View>
  )
}

export default Recover
