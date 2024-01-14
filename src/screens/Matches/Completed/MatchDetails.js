import React from 'react'
import {FlatList} from 'react-native'
import {useMatch, useYBase} from '~/lib/hooks'
import FrameDetail from './components/FrameDetail'
import {Divider, View} from '@ybase'

const MatchDetails = props => {
  const {GetMatchDetails} = useMatch()
  const [matchDetails, setMatchDetails] = React.useState([])
  const [err, setErr] = React.useState('')
  const {colors} = useYBase()

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await GetMatchDetails(props.route.params.matchData.matchId)
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          setMatchDetails(res.data)
        } else {
          setErr(res.error)
        }
      } catch (e) {
        console.log(e)
      }
    })()
  }, [props.route.params.matchData])

  return (
    <View>
      <FlatList
        style={{backgroundColor: colors.surface}}
        data={matchDetails}
        keyExtractor={(item, idx) => idx}
        renderItem={(item, idx) => <FrameDetail item={item} idx={idx} />}
        ItemSeparatorComponent={<Divider />}
      />
    </View>
  )
}

export default MatchDetails
