import React from 'react'
import {useLeague, useYBase} from '~/lib/hooks'
import {useNavigation} from '@react-navigation/native'
import {
  ActivityIndicator,
  Button,
  Pressable,
  Row,
  ScrollView,
  Text,
  View,
} from '@ybase'
import {useTranslation} from 'react-i18next'

const TeamStanding = ({data, idx}) => {
  const [showMore, setShowMore] = React.useState(false)
  const navigation = useNavigation()
  const {colors, theme} = useYBase()
  const {t} = useTranslation()

  function HandleMatchPress(matchId) {
    navigation.navigate('Statistics Match Screen', {matchId: matchId})
  }

  return (
    <>
      <Pressable onPress={() => setShowMore(s => !s)} py={5}>
        <Row alignItems="center">
          <View style={{flex: 1}}>
            <Text>{idx + 1}</Text>
          </View>
          <View style={{flex: 3}}>
            <View
              bgColor={colors.primary}
              borderRadius={theme.roundness}
              p={5}
              mr={5}>
              <Text color={colors.onPrimary}>{data.name}</Text>
            </View>
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
                  : match.home_frames < match.away_frames
                  ? 'L'
                  : 'T'
                : match.home_frames < match.away_frames
                ? 'W'
                : match.home_frames > match.away_frames
                ? 'L'
                : 'T'
            const resColor = colors.onSurface
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
        {showMore && (
          <Button
            py={5}
            onPress={() =>
              navigation.navigate('Team Internal', {
                teamId: data.teamId,
                teamName: data.name,
              })
            }>
            {t('internal_stats')}
          </Button>
        )}
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
