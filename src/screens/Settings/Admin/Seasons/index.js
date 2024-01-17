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
          <Button variant="ghost" onPress={() => props.active(props.idx)}>
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
  const [loading, setLoading] = React.useState(false)

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

  return (
    <View flex={1} px={20}>
      <AddSeason refresh={GetSeasons} />
      {loading && (
        <View flex={1} alignitems="center" justifyContent="center">
          <ActivityIndicator />
        </View>
      )}
      {!loading && (
        <FlatList
          renderItem={({item, idx}) => <Season item={item} idx={idx} />}
          data={seasons}
        />
      )}
    </View>
  )
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
