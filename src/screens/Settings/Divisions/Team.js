import React from 'react'
import Team from '@screens/Settings/Team'
import {useLeague} from '~/lib/hooks'
import {ActivityIndicator, View} from '@ybase'

const _Team = props => {
  const league = useLeague()
  const teamId = props.route.params.teamId ?? null
  const [team, setTeam] = React.useState(null)

  React.useEffect(() => {
    ;(async () => {
      try {
        if (teamId) {
          const res = await league.GetTeamInfo(teamId)
          setTeam(res)
        }
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
