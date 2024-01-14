import React from 'react'
import {Button, Text, TextInput, View} from '@ybase'
import {useAccount, useYBase} from '~/lib/hooks'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useTranslation} from 'react-i18next'
import { ResourceStore } from 'i18next'

const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g

const RecoverVerify = props => {
  const {colors} = useYBase()
  const [loading, setLoading] = React.useState(false)
  const [valid, setValid] = React.useState(false)
  const [err, setErr] = React.useState('')
  const [recoverCode, setRecoverCode] = React.useState(''
  const account = useAccount()
  const {t} = useTranslation()

  async function HandleVerify() {
    try {
      setLoading(true)
      const res = await account.Recover(email)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        props.navigation.navigate('Post Recover')
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View flex={1} bgColor={colors.background} px={20}>
      <View flex={1} mt={20}>
        <View>
          <Text bold fontSize="xxl">
            verification_code
          </Text>
        </View>
        <View mt={20}>
          <TextInput
            autoCapitalize="none"
            placeholder={t('verification_code')}
            value={recoverCode}
            inputLeftElement={
              <View ml={10}>
                <MCI name="code" size={30} color={colors.onSurface} />
              </View>
            }
            onChangeText={text => setRecoverCode(text)}
          />
        </View>
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
