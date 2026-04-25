import Button from '@/components/Button'
import {MatchInfoDataType} from '@/components/Match/types'
import {ThemedText as Text} from '@/components/ThemedText'
import {useLeagueContext} from '@/context/LeagueContext'
import {useMatch} from '@/hooks/useMatch'
import {Ionicons, MaterialIcons} from '@expo/vector-icons'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import {LinearGradient} from 'expo-linear-gradient'
import {Link, useRouter} from 'expo-router'
import {DateTime} from 'luxon'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  useColorScheme,
  View,
} from 'react-native'
import {showLocation} from 'react-native-map-link'

const colorPairs = [
  ['#1e3a8a', '#dc2626'] as const, // Blue & Red
  ['#2563eb', '#f59e0b'] as const, // Blue & Orange
  ['#7c3aed', '#10b981'] as const, // Purple & Green
  ['#db2777', '#3b82f6'] as const, // Pink & Blue
  ['#ea580c', '#0284c7'] as const, // Orange & Blue
  ['#059669', '#7c3aed'] as const, // Green & Purple
  ['#be185d', '#0ea5e9'] as const, // Pink & Light Blue
  ['#b45309', '#6366f1'] as const, // Brown & Indigo
] as const

export default function MatchCard({
  matchInfo: propsMatchInfo,
  idx,
  handlePress,
  showMineOnly,
}: {
  matchInfo: MatchInfoDataType
  idx: number
  handlePress?: (idx: number) => void
  showMineOnly?: boolean
}) {
  const router = useRouter()

  const {t} = useTranslation()
  const {state} = useLeagueContext()
  const match = useMatch()
  const user = state.user
  const [matchInfo, setMatchInfo] = React.useState<MatchInfoDataType | null>(
    null,
  )
  const [isMounted, setIsMounted] = React.useState(false)
  const [showMore, setShowMore] = React.useState(false)
  const {width, height} = Dimensions.get('window')
  const colorScheme = useColorScheme()
  const colors = colorPairs[idx % colorPairs.length]

  // Calculate dynamic font size based on text length and screen width
  const getTeamNameFontSize = (teamName: string) => {
    const baseSize = width * 0.055
    const length = teamName.length
    if (length > 12) {
      return baseSize * 0.85
    } else if (length > 8) {
      return baseSize * 0.9
    }
    return baseSize
  }

  // Calculate win probability based on team records
  const calculateWinProbability = (homeStats: any, awayStats: any) => {
    if (!homeStats || !awayStats) return null

    const homeTotal = homeStats.won + homeStats.lost + homeStats.tied
    const awayTotal = awayStats.won + awayStats.lost + awayStats.tied

    if (homeTotal === 0 && awayTotal === 0) return {home: 50, away: 50}

    // Add a base probability of 10% to each team
    const baseProbability = 0.1
    const homeWinRate = homeTotal > 0 ? homeStats.won / homeTotal : 0
    const awayWinRate = awayTotal > 0 ? awayStats.won / awayTotal : 0

    // Calculate total probability including base chance
    const totalRate =
      homeWinRate + baseProbability + awayWinRate + baseProbability

    // Calculate final probabilities
    const homeProbability = Math.round(
      ((homeWinRate + baseProbability) / totalRate) * 100,
    )
    return {
      home: homeProbability,
      away: 100 - homeProbability,
    }
  }

  React.useEffect(() => {
    setMatchInfo(propsMatchInfo)
    setIsMounted(true)
  }, [propsMatchInfo])

  React.useEffect(() => {
    if (
      isMounted &&
      matchInfo &&
      typeof user?.teams !== 'undefined' &&
      user.teams.length > 0
    ) {
      let i = 0
      let found = false
      while (i < user.teams.length && !found) {
        if (user.teams[i].id === matchInfo.home_team_id) {
          const _matchInfo = {...matchInfo}
          _matchInfo.team_role_id = user.teams[i].team_role_id
          _matchInfo.player_team_id = matchInfo.home_team_id
          setMatchInfo({..._matchInfo})
          found = true
        } else if (user.teams[i].id === matchInfo.away_team_id) {
          const _matchInfo = {...matchInfo}
          _matchInfo.team_role_id = user.teams[i].team_role_id
          _matchInfo.player_team_id = matchInfo.away_team_id
          setMatchInfo({..._matchInfo})
          found = true
        }
        i++
      }
    }
  }, [isMounted])

  function ShowLocation(lat: number | undefined, long: number | undefined) {
    if (typeof lat === 'number' && typeof long === 'number') {
      showLocation({
        latitude: lat,
        longitude: long,
      })
    }
  }

  async function HandleConfirm() {
    if (!matchInfo) return
    const res = await match.ConfirmMatch(
      matchInfo.match_id,
      matchInfo.player_team_id,
    )
    if (res.status === 'ok') {
      const {confirmed, isHome} = res.data
      if (
        typeof confirmed === 'number' &&
        confirmed &&
        typeof isHome === 'boolean'
      ) {
        const _matchInfo = {...matchInfo}
        if (isHome) {
          _matchInfo.home_confirmed = confirmed
        } else {
          _matchInfo.away_confirmed = confirmed
        }
        setMatchInfo({..._matchInfo})
      }
    }
  }

  async function HandlePostpone() {
    router.push({
      pathname: '/PostponeScreen',
      params: {matchInfo: JSON.stringify(matchInfo)},
    })
  }

  async function HandleUnconfirm() {
    if (!matchInfo) return
    const res = await match.UnconfirmMatch(
      matchInfo.match_id,
      matchInfo.player_team_id,
    )
    if (res) {
      if (
        typeof res?.unconfirmed === 'boolean' &&
        res.unconfirmed &&
        typeof res?.isHome === 'boolean'
      ) {
        const _matchInfo = {...matchInfo}
        if (res.isHome) {
          _matchInfo.home_confirmed = 0
        } else {
          _matchInfo.away_confirmed = 0
        }
        setMatchInfo(_matchInfo)
      }
    }
  }

  async function HandleShare() {
    if (!matchInfo) return

    const matchDate = DateTime.fromISO(matchInfo.date)
      .setZone('Asia/Bangkok')
      .toLocaleString(DateTime.DATE_HUGE)

    let message = `${matchInfo.home_team_short_name} vs ${matchInfo.away_team_short_name}\n${matchDate}\n${matchInfo.name}\n${matchInfo.location}`

    // Add map link if coordinates are available
    if (matchInfo.latitude !== 0 && matchInfo.longitude !== 0) {
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${matchInfo.latitude},${matchInfo.longitude}`
      message += `\n\n${t('map')}: ${mapUrl}`
    }

    try {
      await Share.share({
        message,
        title: t('share_match'),
      })
    } catch (error) {
      console.error(error)
    }
  }

  if (!isMounted || !matchInfo) return null
  return (
    <ScrollView contentContainerStyle={{width: width, paddingBottom: 200}}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          flexDirection: 'row',
        }}>
        <LinearGradient
          colors={[colors[0], 'rgba(0,0,0,0.8)']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={{flex: 1}}></LinearGradient>
        <LinearGradient
          colors={[colors[1], 'rgba(0,0,0,0.8)']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={{flex: 1}}></LinearGradient>
      </View>
      <View style={{padding: width * 0.04}}>
        <Link
          href={{
            pathname: '/Match',
            params: {params: JSON.stringify(matchInfo)},
          }}
          asChild>
          <Pressable>
            <View>
              {/* Match Header */}
              <View style={{padding: width * 0.01}}>
                <Text
                  style={{
                    fontSize: width * 0.07,
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: '800',
                    textShadowColor: 'rgba(0, 0, 0, 0.75)',
                    textShadowOffset: {width: 2, height: 2},
                    textShadowRadius: 4,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    fontFamily:
                      Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
                  }}>
                  {DateTime.fromISO(matchInfo.date)
                    .setZone('Asia/Bangkok')
                    .toLocaleString(DateTime.DATE_HUGE)}
                </Text>
                {matchInfo?.postponed_proposal?.newDate && (
                  <Text
                    style={{
                      fontSize: width * 0.035,
                    }}>
                    {t('postponed_to')} {matchInfo?.postponed_proposal?.newDate}
                  </Text>
                )}
                {typeof matchInfo.postponed_proposal !== 'undefined' &&
                  typeof matchInfo?.postponed_proposal?.newDate !==
                    'undefined' &&
                  matchInfo.postponed_proposal.newDate === null && (
                    <Text
                      style={{
                        fontSize: width * 0.07,
                        textAlign: 'center',
                        color: 'red',
                        fontWeight: '800',
                        textShadowColor: 'rgba(0, 0, 0, 0.75)',
                        textShadowOffset: {width: 2, height: 2},
                        textShadowRadius: 4,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        fontFamily:
                          Platform.OS === 'ios'
                            ? 'Helvetica Neue'
                            : 'sans-serif',
                      }}>
                      {t('postponed_indefinitely')}
                    </Text>
                  )}
              </View>

              {/* Teams Section */}
              <View style={{padding: width * 0.06}}>
                <View className="flex-row items-center justify-between">
                  {/* Home Team */}
                  <View className="flex-1 items-center">
                    <View
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        borderRadius: 1000,
                        padding: width * 0.08,
                        marginBottom: width * 0.01,
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                      }}>
                      <Image
                        source={{uri: matchInfo.home_logo}}
                        resizeMode="contain"
                        style={{
                          width: width * 0.25,
                          height: width * 0.25,
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: width * 0.045,
                          fontWeight: 'bold',
                          textAlign: 'center',
                          color: 'white',
                          textShadowColor: 'rgba(0, 0, 0, 0.5)',
                          textShadowOffset: {width: 1, height: 1},
                          textShadowRadius: 2,
                          marginBottom: width * 0.01,
                        }}>
                        #{matchInfo?.homeStats?.rank}
                      </Text>
                      <Text
                        style={{
                          fontSize: getTeamNameFontSize(
                            matchInfo.home_team_short_name,
                          ),
                          fontWeight: '900',
                          textAlign: 'center',
                          color: 'white',
                          textShadowColor: 'rgba(0, 0, 0, 0.8)',
                          textShadowOffset: {width: 3, height: 3},
                          textShadowRadius: 6,
                          transform: [{skewX: '-5deg'}],
                          fontFamily:
                            Platform.OS === 'ios'
                              ? 'Avenir Next'
                              : 'sans-serif-medium',
                          letterSpacing: 1,
                          marginTop: width * 0.02,
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          paddingHorizontal: width * 0.04,
                          paddingVertical: width * 0.01,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.3)',
                          minHeight: width * 0.12,
                          lineHeight: width * 0.06,
                          width: width * 0.4,
                        }}>
                        {matchInfo.home_team_short_name}
                      </Text>
                    </View>
                    <Text
                      style={{
                        marginTop: height * 0.01,
                        fontSize: width * 0.035,
                        color: 'white',
                        textAlign: 'center',
                      }}>
                      {matchInfo?.homeStats?.won} - {matchInfo?.homeStats?.lost}{' '}
                      - {matchInfo?.homeStats?.tied}
                      {calculateWinProbability(
                        matchInfo?.homeStats,
                        matchInfo?.awayStats,
                      ) && (
                        <Text
                          style={{
                            fontSize: width * 0.035,
                            color: 'white',
                            opacity: 1,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            paddingHorizontal: width * 0.02,
                            paddingVertical: width * 0.005,
                            borderRadius: 4,
                            marginLeft: width * 0.01,
                            fontWeight: '700',
                          }}>
                          {' '}
                          (
                          {
                            calculateWinProbability(
                              matchInfo?.homeStats,
                              matchInfo?.awayStats,
                            )?.home
                          }
                          %)
                        </Text>
                      )}
                    </Text>
                  </View>

                  {/* VS */}
                  <View style={{paddingHorizontal: width * 0.04}}>
                    <Text
                      style={{
                        fontSize: width * 0.06,
                        fontWeight: 'bold',
                        color: 'white',
                      }}>
                      VS
                    </Text>
                  </View>

                  {/* Away Team */}
                  <View className="flex-1 items-center">
                    <View
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        borderRadius: 1000,
                        padding: width * 0.08,
                        marginBottom: width * 0.04,
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                      }}>
                      <Image
                        source={{uri: matchInfo.away_logo}}
                        resizeMode="contain"
                        style={{
                          width: width * 0.25,
                          height: width * 0.25,
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: width * 0.045,
                          fontWeight: 'bold',
                          textAlign: 'center',
                          color: 'white',
                          textShadowColor: 'rgba(0, 0, 0, 0.5)',
                          textShadowOffset: {width: 1, height: 1},
                          textShadowRadius: 2,
                          marginBottom: width * 0.01,
                        }}>
                        #{matchInfo?.awayStats?.rank}
                      </Text>
                      <Text
                        style={{
                          fontSize: getTeamNameFontSize(
                            matchInfo.away_team_short_name,
                          ),
                          fontWeight: '900',
                          textAlign: 'center',
                          color: 'white',
                          textShadowColor: 'rgba(0, 0, 0, 0.8)',
                          textShadowOffset: {width: 3, height: 3},
                          textShadowRadius: 6,
                          transform: [{skewX: '5deg'}],
                          fontFamily:
                            Platform.OS === 'ios'
                              ? 'Avenir Next'
                              : 'sans-serif-medium',
                          letterSpacing: 1,
                          marginTop: width * 0.02,
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          paddingHorizontal: width * 0.04,
                          paddingVertical: width * 0.01,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.3)',
                          minHeight: width * 0.12,
                          lineHeight: width * 0.06,
                          width: width * 0.4,
                        }}>
                        {matchInfo.away_team_short_name}
                      </Text>
                    </View>
                    <Text
                      style={{
                        marginTop: height * 0.01,
                        fontSize: width * 0.035,
                        color: 'white',
                        textAlign: 'center',
                      }}>
                      {matchInfo?.awayStats?.won} - {matchInfo?.awayStats?.lost}{' '}
                      - {matchInfo?.awayStats?.tied}
                      {calculateWinProbability(
                        matchInfo?.homeStats,
                        matchInfo?.awayStats,
                      ) && (
                        <Text
                          style={{
                            fontSize: width * 0.035,
                            color: 'white',
                            opacity: 1,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            paddingHorizontal: width * 0.02,
                            paddingVertical: width * 0.005,
                            borderRadius: 4,
                            marginLeft: width * 0.01,
                            fontWeight: '700',
                          }}>
                          {' '}
                          (
                          {
                            calculateWinProbability(
                              matchInfo?.homeStats,
                              matchInfo?.awayStats,
                            )?.away
                          }
                          %)
                        </Text>
                      )}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Venue Info */}
              <Pressable
                onPress={() =>
                  ShowLocation(matchInfo.latitude, matchInfo.longitude)
                }
                style={{
                  padding: height * 0.01,
                  borderWidth: 1,
                  borderColor: colorScheme === 'dark' ? 'white' : 'black',
                  borderRadius: 25,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: width * 0.005,
                  }}>
                  <Ionicons
                    name="location-outline"
                    size={width * 0.04}
                    color="white"
                  />
                  <Text
                    style={{
                      marginLeft: width * 0.01,
                      color: 'white',
                      fontWeight: '600',
                      fontSize: width * 0.035,
                    }}>
                    {matchInfo.name}
                  </Text>
                </View>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                    fontSize: width * 0.035,
                  }}>
                  {matchInfo.location}
                </Text>
              </Pressable>

              {/* Match Status */}
              {matchInfo.home_confirmed > 0 && matchInfo.away_confirmed > 0 && (
                <View
                  style={{
                    backgroundColor: '#059669',
                    padding: width * 0.03,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Ionicons
                      name="checkmark-circle"
                      size={width * 0.04}
                      color="white"
                    />
                    <Text
                      style={{
                        marginLeft: width * 0.01,
                        fontWeight: '600',
                        color: 'white',
                        fontSize: width * 0.035,
                      }}>
                      {t('match_confirmed')}
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={{padding: width * 0.04}}>
                <View className="flex-row justify-center gap-4">
                  <Pressable
                    onPress={HandleShare}
                    className="flex-row items-center justify-center gap-2 border-2 border-white rounded-md p-2">
                    <MCI
                      name="share-outline"
                      size={width * 0.04}
                      color="white"
                    />
                    <Text
                      style={{
                        color: 'white',
                        fontSize: width * 0.035,
                      }}>
                      {t('share')}
                    </Text>
                  </Pressable>
                </View>

                {/* Match Actions */}
                <View style={{marginTop: width * 0.04}}>
                  {matchInfo.home_confirmed > 0 &&
                  matchInfo.away_confirmed > 0 ? (
                    <Button
                      type="outline"
                      onPress={() => HandleUnconfirm()}
                      icon={
                        <Ionicons
                          name="close-circle-outline"
                          size={width * 0.04}
                          color="#f87171"
                        />
                      }
                      style={{borderColor: '#f87171'}}>
                      <Text
                        style={{
                          color: '#f87171',
                          fontSize: width * 0.035,
                        }}>
                        {t('unconfirm')}
                      </Text>
                    </Button>
                  ) : user.id && user.teams.length > 0 ? (
                    <>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          gap: width * 0.04,
                        }}>
                        <Button
                          type="primary"
                          onPress={() => HandleConfirm()}
                          icon={
                            <Ionicons
                              name="checkmark-circle-outline"
                              size={width * 0.04}
                              color="white"
                            />
                          }
                          style={{backgroundColor: '#1e3a8a', flex: 1}}>
                          <Text
                            style={{
                              fontSize: width * 0.035,
                              color: 'white',
                              fontWeight: '600',
                            }}>
                            {t('confirm_attendance')}
                          </Text>
                        </Button>
                        <Button
                          type="outline"
                          onPress={() => HandlePostpone()}
                          icon={
                            <MaterialIcons
                              name="schedule"
                              size={width * 0.04}
                              color="white"
                            />
                          }
                          style={{
                            borderColor: 'white',
                            flex: 1,
                          }}>
                          <Text
                            style={{
                              color: 'white',
                              fontSize: width * 0.035,
                              fontWeight: '600',
                              textAlign: 'center',
                            }}>
                            {t('reschedule')}
                          </Text>
                        </Button>
                      </View>
                    </>
                  ) : null}
                </View>
              </View>
            </View>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  )
}
