import React from 'react'
import Team from '@screens/Team'
import {View} from 'react-native'
import {useLeague} from '~/lib/hooks'
import {ActivityIndicator} from 'react-native-paper'

const _Team = props => {
  const league = useLeague()
  const teamId = props.route.params.team?.id ?? null
  const [team, setTeam] = React.useState(null)

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await league.GetTeamInfo(teamId)
        setTeam(res)
      } catch (e) {
        console.log(e)
      }
    })()
  }, [teamId])

  if (team) {
    return <Team team={team} />
  } else {
    return (
      <View>
        <ActivityIndicator />
      </View>
    )
  }
}

export default _Team
