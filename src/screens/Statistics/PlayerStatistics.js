import React from 'react'
import {FlatList, View} from 'react-native'
import {Text} from 'react-native-paper'
import {useLeague} from '~/lib/hooks'

const PlayerListing = ({data, idx}) => {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <View style={{flex: 1}}>
        <Text>{idx + 1}</Text>
      </View>
      <View style={{flex: 2}}>
        <Text>{data.name}</Text>
      </View>
      <View style={{flex: 1}}>
        <Text>{data.played}</Text>
      </View>
      <View style={{flex: 1}}>
        <Text>{data.won}</Text>
      </View>
      <View style={{flex: 1}}>
        <Text>{data.rawPerfDisp}</Text>
      </View>
      <View style={{flex: 1}}>
        <Text>{data.adjPerfDisp}</Text>
      </View>
    </View>
  )
}

const PlayerStatistics = props => {
  const league = useLeague()
  const [playerStats, setPlayerStats] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      try {
        setIsLoading(true)
        const res = await GetPlayerStats()
        setPlayerStats(res)
      } catch (e) {
        console.log(e)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  async function GetPlayerStats() {
    try {
      const res = await league.GetPlayerStats()
      return res
    } catch (e) {
      console.log(e)
      return []
    }
  }
  return (
    <View>
      <FlatList
        data={playerStats}
        renderItem={({item, index}) => <PlayerListing data={item} idx={index} />}
      />
    </View>
  )
}

export default PlayerStatistics
