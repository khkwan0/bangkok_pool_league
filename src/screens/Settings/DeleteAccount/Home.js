import React from 'react'
import {Button, Row, Text, View} from '@ybase'
import {useAccount, useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'

const DeleteAccountHome = props => {
  const {colors} = useYBase()
  const {t} = useTranslation()
  const account = useAccount()
  const [err, setErr] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function HandleDelete() {
    try {
      setErr('')
      setLoading(true)
      /*
      const res = await account.DeleteAccount()
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        props.navigation.navigate('Delete Success')
      } else {
        setErr(res.error)
      }
      */
      props.navigation.navigate('Delete Success')
    } catch (e) {
      setErr('server_error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View flex={1} px={20} bgColor={colors.background}>
      <View flex={1} />
      <View flex={2}>
        <Text bold textAlign="center">
          confirm_delete_account
        </Text>
        <Row alignItems="center" space={20} mt={20}>
          <View flex={1}>
            <Button variant="outline" onPress={() => props.navigation.goBack()}>
              {t('cancel')}
            </Button>
          </View>
          <View flex={1}>
            <Button onPress={() => HandleDelete()}>{t('delete')}</Button>
          </View>
        </Row>
        {err && (
          <View mt={20}>
            <Text color={colors.error}>{err}</Text>
          </View>
        )}
      </View>
      <View flex={1} />
    </View>
  )
}

export default DeleteAccountHome
