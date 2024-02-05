import React from 'react'
import {useLeague, useYBase} from '~/lib/hooks'
import {useNavigation} from '@react-navigation/native'
import {ActivityIndicator, Pressable, Row, ScrollView, Text, View} from '@ybase'

const TeamStanding = ({data, idx}) => {
  const [showMore, setShowMore] = React.useState(false)
  const navigation = useNavigation()

  function HandleMatchPress(matchId) {
    navigation.navigate('Statistics Match Screen', {matchId: matchId})
  }

  return (
    <>
      <Pressable onPress={() => setShowMore(s => !s)}>
        <Row alignItems="center">
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
        </Row>
      </Pressable>
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
              <Pressable
                key={matchIdx}
                onPress={() => HandleMatchPress(match.match_id)}>
                <View
                  style={{
                    flexDirection: 'row',
                    paddingHorizontal: 20,
                    paddingVertical: 5,
                  }}>
                  <View style={{flex: 2}}>
                    <Text>{`vs ${vsTeam} (${homeAway})`}</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={{color: resColor}}>{result}</Text>
                  </View>
                </View>
              </Pressable>
            )
          })}
      </View>
    </>
  )
}

const TeamStatisticsHeader = props => {
  return (
    <Row alignItems="center">
      <View flex={1}>
        <Text bold>Rank</Text>
      </View>
      <View flex={3}>
        <Text bold>Team</Text>
      </View>
      <View flex={1}>
        <Text bold>Pts</Text>
      </View>
      <View flex={1}>
        <Text bold>W/L</Text>
      </View>
      <View flex={1}>
        <Text bold>Frames</Text>
      </View>
    </Row>
  )
}
const TeamStatistics = props => {
  const league = useLeague()
  const [stats, setStats] = React.useState({})
  const [isLoading, setIsLoading] = React.useState(false)
  const {colors} = useYBase()

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
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          backgroundColor: colors.background,
        }}>
        <View my={10}>
          <Text bold fontSize="xl">
            8-Ball
          </Text>
        </View>
        <TeamStatisticsHeader />
        {typeof stats.eightBall !== 'undefined' &&
          stats.eightBall.map((item, index) => (
            <TeamStanding key={'8b' + index} data={item} idx={index} />
          ))}
        <View my={10}>
          <Text bold fontSize="xl">
            9-Ball
          </Text>
        </View>
        <TeamStatisticsHeader />
        {typeof stats.nineBall !== 'undefined' &&
          stats.nineBall.map((item, index) => (
            <TeamStanding key={'9b' + index} data={item} idx={index} />
          ))}
      </ScrollView>
    )
  }
}

export default TeamStatistics
