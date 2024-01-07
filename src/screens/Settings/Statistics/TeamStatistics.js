import React from 'react'
import {FlatList, View} from 'react-native'
import {useLeague} from '~/lib/hooks'
import {ActivityIndicator, Text, TouchableRipple} from 'react-native-paper'
import {useNavigation} from '@react-navigation/native'

const TeamStanding = ({data, idx}) => {
  const [showMore, setShowMore] = React.useState(false)
  const navigation = useNavigation()

  function HandleMatchPress(matchId) {
    navigation.navigate('Statistics Match Screen', {matchId: matchId})
  }

  return (
    <>
      <TouchableRipple onPress={() => setShowMore(s => !s)}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}>
          <View style={{flex: 1}}>
            <Text>{idx + 1}</Text>
          </View>
          <View style={{flex: 3}}>
            <Text>{data.name}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text>{data.points}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text>
              {data.won}:{data.lost}
            </Text>
          </View>
          <View style={{flex: 1}}>
            <Text>{data.frames}</Text>
          </View>
        </View>
      </TouchableRipple>
      <View>
        {showMore &&
          data.matches.map((match, matchIdx) => {
            const result =
              match.home_team === data.name
                ? match.home_frames > match.away_frames
                  ? 'W'
                  : 'L'
                : match.home_frames < match.away_frames
                ? 'W'
                : 'L'
            const resColor = result === 'W' ? '#00f' : '#f00'
            const vsTeam =
              match.home_team === data.name ? match.away_team : match.home_team
            const homeAway = match.home_team === data.name ? 'Home' : 'Away'
            return (
              <TouchableRipple
                key={matchIdx}
                onPress={() => HandleMatchPress(match.match_id)}>
                <View style={{flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 5}}>
                  <View style={{flex: 2}}>
                    <Text>{`vs ${vsTeam} (${homeAway})`}</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={{color: resColor}}>{result}</Text>
                  </View>
                </View>
              </TouchableRipple>
            )
          })}
      </View>
    </>
  )
}

const TeamStatistics = props => {
  const league = useLeague()
  const [stats, setStats] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      try {
        setIsLoading(true)
        const res = await GetTeamStats()
        setStats(res)
      } catch (e) {
        console.log(e)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  async function GetTeamStats() {
    try {
      const res = await league.GetTeamStats()
      return res
    } catch (e) {
      console.log(e)
      return []
    }
  }

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator />
      </View>
    )
  } else {
    return (
      <FlatList
        data={stats}
        ListHeaderComponent={
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}>
            <View style={{flex: 1}}>
              <Text>Rank</Text>
            </View>
            <View style={{flex: 3}}>
              <Text>Team</Text>
            </View>
            <View style={{flex: 1}}>
              <Text>Pts</Text>
            </View>
            <View style={{flex: 1}}>
              <Text>W:L</Text>
            </View>
            <View style={{flex: 1}}>
              <Text>Frames</Text>
            </View>
          </View>
        }
        renderItem={({item, index}) => <TeamStanding data={item} idx={index} />}
      />
    )
  }
}

export default TeamStatistics
