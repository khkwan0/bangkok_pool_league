import React from 'react'
import {Row, Text, View} from '@ybase'
import {useLeague, useYBase} from '~/lib/hooks'
import SeasonPicker from '@components/SeasonPicker'
import {FlatList} from 'react-native'

const Division = props => {
  return (
    <View key={`divisions_teams_${props.idx}`}>
      <Text textAlign="center" bold fontSize="xxxl">
        {props.item.divisionName}
      </Text>
      <Row alignItems="center">
        <View flex={1}>
          <Text fontSize="lg">team_id</Text>
        </View>
        <View flex={3}>
          <Text fontSize="xxl">name</Text>
        </View>
      </Row>
      {props.item.teams
        .sort((a, b) => (a.teamName > b.teamName ? 1 : -1))
        .map(team => {
          return (
            <View my={5} key={'someteam' + team.teamName}>
              <Row alignItems="center">
                <View flex={1}>
                  <Text fontSize="lg">#{team.teamId}</Text>
                </View>
                <View flex={3}>
                  <Text fontSize="xxl">{team.teamName}</Text>
                </View>
              </Row>
            </View>
          )
        })}
    </View>
  )
}
const Divisions = props => {
  const {colors} = useYBase()
  const [season, setSeason] = React.useState(0)
  const [divisions, setDivisions] = React.useState([])
  const [err, setErr] = React.useState('')
  const league = useLeague()

  async function GetTeamDivisionsBySeason() {
    try {
      setErr('')
      const res = await league.GetTeamDivisionsBySeason(season)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        const _divisions = {}
        res.data.forEach(team => {
          if (typeof _divisions[team.division_id] === 'undefined') {
            _divisions[team.division_id] = {
              divisionName: team.division_name,
              teams: [],
            }
          }
          _divisions[team.division_id].teams.push({
            teamId: team.team_id,
            teamName: team.name,
          })
        })
        setDivisions(_divisions)
      } else {
        setErr(res.error)
      }
    } catch (e) {
      console.log(e)
      setErr('server_error')
    }
  }

  async function GetSeason() {
    try {
      setErr('')
      const res = await league.GetSeasonV2()
      setSeason(res[0].id)
    } catch (e) {
      console.log(e)
      setErr(e.message)
    }
  }

  React.useEffect(() => {
    if (season > 0) {
      GetTeamDivisionsBySeason()
    }
  }, [season])

  React.useEffect(() => {
    GetSeason()
  }, [])

  return (
    <View flex={1} bgColor={colors.background} px={20}>
      <SeasonPicker season={season} setSeason={setSeason} />
      {err && (
        <View mt={20}>
          <Text color={colors.error}>{err}</Text>
        </View>
      )}
      <FlatList
        data={Object.keys(divisions)}
        ItemSeparatorComponent={<View my={10} />}
        renderItem={({item, index}) => (
          <Division item={divisions[item]} idx={index} />
        )}
        keyExtractor={(item, index) => 'team_div' + index}
      />
    </View>
  )
}

export default Divisions
