import React from 'react'
import {FlatList} from 'react-native'
import {ActivityIndicator, View, Text} from '@ybase'
import MatchDateCard from './components/MatchDateCard'
import {useSelector} from 'react-redux'
import {useLeague, useSeason, useYBase} from '~/lib/hooks'
import SeasonPicker from '@components/SeasonPicker'

const CompletedMatches = props => {
  const [dates, setDates] = React.useState([])
  const [season, setSeason] = React.useState(-1)
  const [refreshing, setRefreshing] = React.useState(false)
  const [err, setErr] = React.useState('')
  const [filterPlayerOnly, setFilterPlayerOnly] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const user = useSelector(_state => _state.userData).user
  const {GetMatches, GetCompletedMatchesBySeason} = useSeason()
  const league = useLeague()
  const {colors} = useYBase()

  React.useEffect(() => {
    ;(async () => {
      const query = []
      try {
        if (
          typeof user?.teams === 'undefined' ||
          !user.teams ||
          user.teams.length === 0
        ) {
          query.push('noteam=true')
        }
        query.push('completed=true')
        /*
        const res = await GetMatches(query)
        setDates(res)
        */
      } catch (e) {
        console.log(e)
      }
    })()
  }, [user])

  async function GetCompletedMatches() {
    try {
      setErr('')
      setRefreshing(true)
      const res = await GetCompletedMatchesBySeason(season)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        setDates(res.data)
        setIsMounted(true)
      } else {
        setErr(res.error)
      }
    } catch (e) {
      console.log(e)
      setErr('server_error')
    } finally {
      setRefreshing(false)
    }
  }

  async function GetCurrentSeason() {
    try {
      const res = await league.GetSeasonV2()
      if (typeof res?.[0].id !== 'undefined') {
        setSeason(res[0].id)
      } else {
        setErr('get_current_season_error')
      }
    } catch (e) {
      setErr('server_error')
    }
  }

  React.useEffect(() => {
    GetCurrentSeason()
  }, [])

  React.useEffect(() => {
    if (season > -1) {
      setDates([])
      GetCompletedMatches()
    }
  }, [season])

  if (isMounted) {
    return (
      <View flex={1} bgColor={colors.background}>
        <View mt={20} px={20}>
          <SeasonPicker season={season} setSeason={setSeason} />
        </View>
        <FlatList
          refreshing={refreshing}
          style={{backgroundColor: colors.background}}
          keyExtractor={(item, index) =>
            item.home_team_id + item.away_team_id + item.date + index
          }
          data={dates}
          renderItem={({item, index}) => (
            <MatchDateCard matchDate={item} idx={index} />
          )}
        />
      </View>
    )
  } else {
    return (
      <View flex={1} alignItems="center" justifyContent="center">
        {!err && <ActivityIndicator />}
        {err && (
          <Text color={colors.error} textAlign="center">
            {err}
          </Text>
        )}
      </View>
    )
  }
}

export default CompletedMatches
