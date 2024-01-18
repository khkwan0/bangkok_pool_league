import React from 'react'
import {ActivityIndicator, Button, Row, Text, View} from '@ybase'
import {useTranslation} from 'react-i18next'
import {useLeague, useYBase} from '~/lib/hooks'
import {FlatList} from 'react-native'
import AddSeason from './components/AddSeason'

const Season = props => {
  const {colors} = useYBase()
  const {t} = useTranslation()
  const season = props.item

  return (
    <Row alignItems="center" py={5}>
      <View flex={1}>
        <Text>Season {season.identifier ? season.identifier : season.id}</Text>
        <Text>{season.name}</Text>
      </View>
      <View flex={1}>
        {season.status_id === 1 ? (
          <Text fontSize="xl" color={colors.success} bold>
            {t('active').toUpperCase()}
          </Text>
        ) : (
          <Text>inactive</Text>
        )}
      </View>
      {season.status_id !== 1 && (
        <View flex={1}>
          <Button
            variant="ghost"
            loading={props.loading}
            onPress={() => props.activate(props.idx)}>
            {t('activate')}
          </Button>
        </View>
      )}
      {season.status_id === 1 && <View flex={1} />}
    </Row>
  )
}

const Seasons = props => {
  const league = useLeague()
  const [seasons, setSeasons] = React.useState([])
  const [err, setErr] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const {colors} = useYBase()

  async function GetSeasons() {
    try {
      setLoading(true)
      const res = await league.GetSeasons()
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        setSeasons(res.data.sort((a, b) => b.sortorder - a.sortorder))
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }
  React.useEffect(() => {
    GetSeasons()
  }, [])

  async function ActivateSeason(idx) {
    try {
      setLoading(true)
      setErr('')
      const res = await league.ActivateSeason(seasons[idx].id)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        GetSeasons()
      } else {
        setErr(res.error)
      }
    } catch (e) {
      setErr('server_error')
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  if (seasons.length > 0) {
    return (
      <View flex={1} px={20} bgColor={colors.background}>
        <AddSeason refresh={GetSeasons} />
        {err && (
          <View mt={20}>
            <Text textAlign="center" color={colors.error}>
              {err}
            </Text>
          </View>
        )}
        {loading && (
          <View flex={1} alignitems="center" justifyContent="center">
            <ActivityIndicator />
          </View>
        )}
        {!loading && (
          <FlatList
            renderItem={({item, index}) => (
              <Season
                item={item}
                idx={index}
                activate={ActivateSeason}
                props={loading}
              />
            )}
            data={seasons}
          />
        )}
      </View>
    )
  } else {
    return null
  }
  /*
  return (
    <ScrollView
      contentContainerStyle={{flex: 1, backgroundColor: colors.background}}>
      <View flex={1} px={20}>
        <View flex={1} />
        <View flex={3}>
          <Text bold textAlign="center" fontSize={84}>
            {t('season_number', {n: season})}
          </Text>
        </View>
        <View pb={Math.max(insets.bottom, 20)}>
          <Button
            onPress={() =>
              props.navigation.navigation('admin_seasons_new', {
                currentSeason: season,
              })
            }>
            {t('start_new_season')}
          </Button>
        </View>
      </View>
    </ScrollView>
  )
  */
}

export default Seasons
