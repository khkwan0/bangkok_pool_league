import React from 'react'
import {TeamStats, useLeague} from '@/hooks'
import Button from '@/components/Button'
import {ActivityIndicator, Pressable, ScrollView, View} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as Card} from '@/components/ThemedView'
import {useTranslation} from 'react-i18next'
import Row from '@/components/Row'
import {t} from 'i18next'
import {useRouter, useNavigation} from 'expo-router'

const TeamStanding = ({data, idx}) => {
  const [showMore, setShowMore] = React.useState(false)
  const {t} = useTranslation()
  const router = useRouter()

  function HandleMatchPress(matchId: number) {
    router.push({
      pathname: '/statistics/MatchScreen',
      params: {matchId: matchId},
    })
  }

  return (
    <>
      <Pressable onPress={() => setShowMore(s => !s)} className="py-2">
        <Card className="flex-row p-4 rounded-lg">
          <View style={{flex: 1}}>
            <Text>{idx + 1}</Text>
          </View>
          <View style={{flex: 3}}>
            <View className="rounded-md mr-5">
              <Text type="link">{data.name}</Text>
            </View>
          </View>
          <View style={{flex: 1}}>
            <Text className="text-center">{data.points}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text className="text-center">
              {data.won}:{data.lost}
            </Text>
          </View>
          <View style={{flex: 1}}>
            <Text className="text-center">{data.frames}</Text>
          </View>
        </Card>
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
            const vsTeam =
              match.home_team === data.name ? match.away_team : match.home_team
            const homeAway = match.home_team === data.name ? 'Home' : 'Away'
            return (
              <Pressable
                key={matchIdx}
                onPress={() => HandleMatchPress(match.match_id)}>
                <Row className="px-4 py-2">
                  <View style={{flex: 2}}>
                    <Text
                      type="link"
                      className="text-lg">{`vs ${vsTeam} (${homeAway})`}</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text>{result}</Text>
                  </View>
                </Row>
              </Pressable>
            )
          })}
        
        {/*showMore && (
          <Button
            className="py-2"
            onPress={() =>
              router.push({
                pathname: '/Statistics/TeamInternal',
                params: {
                  teamId: data.teamId,
                  teamName: data.name,
                },
              })
            }>
            {t('internal_stats')}
          </Button>
        )*/}
      </View>
    </>
  )
}

const TeamStatisticsHeader = () => {
  return (
    <View className="flex-row px-4">
      <View style={{flex: 1}}>
        <Text className="text-left">Rank</Text>
      </View>
      <View style={{flex: 3}}>
        <Text className="text-left">Team</Text>
      </View>
      <View style={{flex: 1}}>
        <Text className="text-center">Pts</Text>
      </View>
      <View style={{flex: 1}}>
        <Text className="text-center">W/L</Text>
      </View>
      <View style={{flex: 1}}>
        <Text className="text-center">Frames</Text>
      </View>
    </View>
  )
}
const TeamStatistics = () => {
  const league = useLeague()
  const [stats, setStats] = React.useState<TeamStats>({})
  const [isLoading, setIsLoading] = React.useState(false)
  const navigation = useNavigation()

  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Team Statistics',
      headerBackTitle: t('back'),
    })
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
        }}>
        <View className="my-4">
          <Text type="subtitle">8-Ball</Text>
        </View>
        <TeamStatisticsHeader />
        {typeof stats.eightBall !== 'undefined' &&
          stats.eightBall.map((item, index) => (
            <TeamStanding key={'8b' + index} data={item} idx={index} />
          ))}
        <View className="my-4">
          <Text type="subtitle">9-Ball</Text>
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
