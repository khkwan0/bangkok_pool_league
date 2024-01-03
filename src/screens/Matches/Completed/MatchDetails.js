import React from 'react'
import {View} from 'react-native'
import {useSeason} from '~/lib/hooks'

const MatchDetails = props => {
  const {GetMatchDetails} = useSeason()

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await GetMatchDetails(props.route.params.matchData.matchId)
        console.log(res)
      } catch (e) {
        console.log(e)
      }
    })()
  }, [props.route.params.matchData])

  return <View />
}

export default MatchDetails
