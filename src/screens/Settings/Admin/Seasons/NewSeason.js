import React from 'react'
import {Button, Row, Text, View} from '@ybase'
import {useLeague, useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'

const NewSeason = props => {
  const {colors} = useYBase()
  const {t} = useTranslation()
  const league = useLeague()
  const [err, setErr] = React.useState('')

  async function HandleNewSeason() {
    try {
      setErr('')
      const res = await league.AddNewSeason(
        props.route.params.currentSeason + 1,
      )
      if (res.status === 'ok') {
        props.navigation.navigate('admin_seasons_new_success')
      } else {
        setErr(res.error)
      }
    } catch (e) {
      console.log(e)
      setErr(e.message)
    }
  }

  return (
    <View flex={1} px={20} bgColor={colors.background}>
      <Text>
        {t('new_season_confirm', {n: props.route.params.currentSeason + 1})}
      </Text>
      <Row alignItems="center">
        <View flex={1}>
          <Button onPress={() => props.navigation.goBack()}>
            {t('cancel')}
          </Button>
        </View>
        <View flex={1}>
          <Button onPress={() => HandleNewSeason()}>{t('confirm')}</Button>
        </View>
      </Row>
    </View>
  )
}

export default NewSeason
