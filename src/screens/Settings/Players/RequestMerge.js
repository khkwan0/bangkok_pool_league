import React from 'react'
import {Button, Row, Text, View} from '@ybase'
import {useLeague, useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'
import {useSelector} from 'react-redux'

const RequestMerge = props => {
  const {colors} = useYBase()
  const [err, setErr] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const {t} = useTranslation()
  const league = useLeague()
  const user = useSelector(_state => _state.userData).user

  const player = props?.route?.params?.playerInfo ?? null

  async function HandleMerge() {
    try {
      setLoading(true)
      const res = await league.MergePlayer(user.id, player.id)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        props.navigation.navigate('Merge Request Success')
      } else {
        setErr(res.error)
      }
    } catch (e) {
      console.log(e)
      setErr('server_error')
    } finally {
      setLoading(false)
    }
  }
  return (
    <View flex={1} bgColor={colors.background} px={20}>
      <View flex={1}>
        <Text textAlign="center" bold fontSize="xxl">
          {t('you')}:
        </Text>
        <Text bold textAlign="center" fontSize="xxxl">
          #{user.id}
        </Text>
        <Text bold textAlign="center" fontSize="xxxl">
          {user.nickname}
        </Text>
      </View>
      <View flex={2}>
        <View>
          <Text textAlign="center" bold fontSize="xl">
            {t('request_merge_into')}:
          </Text>
        </View>
        <Row my={20}>
          <View flex={1} />
          <View flex={1}>
            <Text bold fontSize="xxxl">
              #{player.id}
            </Text>
            <Text bold fontSize="xxxl">
              {player.nickname}
            </Text>
          </View>
          <View flex={1} />
        </Row>
      </View>
      <View flex={1}>
        {err && (
          <View>
            <Text textAlign="center" color={colors.error} bold>
              {err}
            </Text>
          </View>
        )}
        <Row alignItems="center" space={20}>
          <View flex={1}>
            <Button variant="outline" onPress={() => props.navigation.goBack()}>
              {t('cancel')}
            </Button>
          </View>
          <View flex={1}>
            <Button loading={loading} onPress={() => HandleMerge()}>
              {t('request_merge')}
            </Button>
          </View>
        </Row>
      </View>
    </View>
  )
}

export default RequestMerge
