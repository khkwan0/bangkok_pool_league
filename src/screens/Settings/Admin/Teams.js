import React from 'react'
import {Pressable, Row, Text, View} from '@ybase'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useTranslation} from 'react-i18next'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useLeague, useYBase} from '~/lib/hooks'
import {FlatList} from 'react-native'

const Team = props => {
  const team = props.item.item
  return (
    <View py={5}>
      <Row alignItems="center">
        <View flex={2}>
          <Text>{team.id} {team.name}</Text>
        </View>
        <View flex={1}>
          <Text>{team.division_short_name}</Text>
        </View>
      </Row>
    </View>
  )
}
const Teams = props => {
  const {colors} = useYBase()
  const league = useLeague()
  const {t} = useTranslation()
  const [seasons, setSeasons] = React.useState([])
  const [season, setSeason] = React.useState(null)
  const [teams, setTeams] = React.useState([])

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await league.GetSeasons()
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          setSeasons(res.data)
        }
      } catch (e) {
        console.log(e)
      }
    })()
  }, [])

  React.useEffect(() => {
    ;(async () => {
      try {
        const res2 = await league.GetSeasonV2()
        setSeason(res2[0].id)
      } catch (e) {
        console.log(e)
      }
    })()
  }, [])

  async function GetTeamsBySeason() {
    try {
      const res = await league.GetTeamsBySeason(season)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        setTeams(res.data)
      }
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    GetTeamsBySeason()
  }, [season])

  return (
    <FlatList
      contentContainerStyle={{paddingHorizontal: 20}}
      ListHeaderComponent={<Text textAlign="center" bold fontSize="xxxl" mb={20}>{t('season_number', {n: season})}</Text>}
      data={teams}
      renderItem={(item, idx) => <Team item={item} idx={idx} />}
    />
  )
}

export default Teams
