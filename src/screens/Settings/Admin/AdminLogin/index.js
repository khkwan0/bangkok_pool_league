import React from 'react'
import {Button, Pressable, Row, Text, TextInput, View} from '@ybase'
import {useYBase, useAccount} from '~/lib/hooks'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useTranslation} from 'react-i18next'

const AdminLogin = props => {
  const [err, setErr] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [playerId, setPlayerId] = React.useState('')
  const {colors} = useYBase()
  const account = useAccount()

  async function HandleLogin() {
    try {
      if (playerId) {
        setErr('')
        setLoading(true)
        const res = await account.AdminLogin(playerId)
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          props.navigation.replace('Settings')
        } else {
          if (typeof res.status !== 'undefined' && res.status === 'error') {
            setErr(res.error)
          }
        }
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }
  return (
    <View flex={1} bgColor={colors.background} px={20}>
      <View flex={1} />
      <View flex={2}>
        <View my={20}>
          <TextInput
            value={playerId}
            autoCapitalize="none"
            onChangeText={text => setPlayerId(text)}
            placeholder="Player ID"
          />
        </View>
      </View>
      <View flex={1}>
        {err && (
          <View>
            <Text textAlign="center" color={colors.error}>
              {err}
            </Text>
          </View>
        )}
        <Button loading={loading} onPress={() => HandleLogin()}>
          Login
        </Button>
      </View>
    </View>
  )
}

export default AdminLogin
