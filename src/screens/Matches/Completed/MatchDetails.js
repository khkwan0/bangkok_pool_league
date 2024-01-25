import React from 'react'
import {FlatList} from 'react-native'
import {useMatch, useYBase} from '~/lib/hooks'
import FrameDetail from './components/FrameDetail'
import {Divider, View} from '@ybase'
import MatchHeader from './components/MatchHeader'
import {useTranslation} from 'react-i18next'

const MatchDetails = props => {
  const {GetMatchDetails} = useMatch()
  const [matchDetails, setMatchDetails] = React.useState([])
  const [err, setErr] = React.useState('')
  const {colors} = useYBase()
  const {t} = useTranslation()

  React.useEffect(() => {
    props.navigation.setOptions({
      headerTitle: t('match') + ' #' + props.route.params.matchData.matchId,
    })
  }, [])

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await GetMatchDetails(props.route.params.matchData.matchId)
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          if (res.data.length > 0) {
            setMatchDetails(res.data)
          } else {
            props.navigation.replace('Post Match Screen', {
              matchInfo: {
                match_id: props.route.params.matchData.matchId,
                away_team_id: props.route.params.matchData.away_team_id,
                home_team_id: props.route.params.matchData.home_team_id,
                home_team_name: props.route.params.matchData.home_team_name,
                away_team_name: props.route.params.matchData.away_team_name,
                format: props.route.params.matchData.format,
              },
            })
          }
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
        ListHeaderComponent={
          <MatchHeader matchData={props.route.params.matchData} />
        }
        style={{backgroundColor: colors.surface}}
        data={matchDetails}
        keyExtractor={(item, idx) => 'asdasd' + idx}
        renderItem={(item, idx) => <FrameDetail item={item} idx={idx} />}
        ItemSeparatorComponent={<Divider />}
      />
    </View>
  )
}

export default MatchDetails
