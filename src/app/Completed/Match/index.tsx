import {ThemedView as View} from '@/components/ThemedView'
import {useLocalSearchParams} from 'expo-router'
import {useMatch} from '@/hooks'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useSeason} from '@/hooks'
import {FlatList} from 'react-native'
import Divider from '@/components/Divider'
import MatchHeader from '@/components/Completed/MatchHeader'
import FrameDetail from '@/components/Completed/FrameDetail'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
export default function Match() {
  const {params} = useLocalSearchParams()
  const {GetMatchDetails} = useMatch()
  const [matchDetails, setMatchDetails] = React.useState([])
  const [err, setErr] = React.useState('')
  const {t} = useTranslation()
  const season = useSeason()
  const insets = useSafeAreaInsets()

  const matchInfo = JSON.parse(params)

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await season.GetMatchStats(matchInfo.matchId)
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          setMatchDetails(res.data)
        } else {
          setErr(res.error)
        }
      } catch (e) {
        console.log(e)
      }
    })()
  }, [matchInfo.matchId, season])

  if (matchDetails.length > 0) {
    return (
      <View>
        <FlatList
          contentContainerStyle={{paddingBottom: insets.bottom}}
          ListHeaderComponent={<MatchHeader matchData={matchDetails} />}
          data={matchDetails}
          keyExtractor={(item, idx) => 'asdasd' + idx}
          renderItem={({item, index}) => (
            <FrameDetail item={item} idx={index} matchId={matchInfo.matchId} />
          )}
          ItemSeparatorComponent={<Divider />}
        />
      </View>
    )
  } else {
    return null
  }
}
