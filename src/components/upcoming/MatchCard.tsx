import React from 'react'
import {Image, Pressable, Appearance, Share} from 'react-native'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import Row from '@/components/Row'
import {DateTime} from 'luxon'
import {showLocation} from 'react-native-map-link'
import {useTranslation} from 'react-i18next'
import {Link} from 'expo-router'
import {MatchInfoDataType} from '@/components/Match/types'
import Button from '@/components/Button'
import {useLeagueContext} from '@/context/LeagueContext'
import {useMatch} from '@/hooks/useMatch'
import {useRouter} from 'expo-router'
import {Ionicons, MaterialIcons} from '@expo/vector-icons'

export default function MatchCard({
  matchInfo: propsMatchInfo,
}: {
  matchInfo: MatchInfoDataType
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
    <View
      style={{
        margin: 10,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
      <Link
        href={{
          pathname: '/Match',
          params: {params: JSON.stringify(matchInfo)},
        }}
        asChild>
        <Pressable>
          <View>
            {/* Header Section with Teams and Date */}
            <View className="mb-4">
              <View className="flex-row justify-center items-center mb-2">
                <Text
                  type="subtitle"
                  className="text-center font-bold"
                  style={{flex: 3}}>
                  {matchInfo.home_team_short_name}
                </Text>
                <Text type="subtitle" className="text-center" style={{flex: 1}}>
                  vs
                </Text>
                <Text
                  type="subtitle"
                  className="text-center font-bold"
                  style={{flex: 3}}>
                  {matchInfo.away_team_short_name}
                </Text>
              </View>
              <View className="flex-row justify-center items-center">
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  style={{marginRight: 6}}
                  color={
                    Appearance.getColorScheme() === 'dark' ? 'white' : 'black'
                  }
                />
                <Text type="subtitle" className="text-center">
                  {DateTime.fromISO(matchInfo.date)
                    .setZone('Asia/Bangkok')
                    .toLocaleString(DateTime.DATE_HUGE)}
                </Text>
              </View>
              {matchInfo.postponed_proposal?.newDate &&
                !(matchInfo.home_confirmed && matchInfo.away_confirmed) && (
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 0, 0, 0.1)',
                      borderColor: 'red',
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 10,
                      marginTop: 8,
                    }}>
                    <View className="flex-row items-center justify-center mb-1">
                      <MaterialIcons
                        name="warning"
                        size={18}
                        color="red"
                        style={{marginRight: 6}}
                      />
                      <Text
                        type="subtitle"
                        className="text-center font-bold"
                        style={{color: 'red'}}>
                        {t('proposed_date')}
                      </Text>
                    </View>
                    <Text type="subtitle" className="text-center">
                      {DateTime.fromISO(matchInfo.postponed_proposal.newDate)
                        .setZone('Asia/Bangkok')
                        .toLocaleString(DateTime.DATE_HUGE)}
                    </Text>
                  </View>
                )}
            </View>

            {/* Venue Information */}
            <Row className="mb-4">
              <View flex={2}>
                <View className="mb-2">
                  <Text className="text-gray-500 mb-1">
                    {t('match')} ID: {matchInfo.match_id}
                  </Text>
                  <Text className="font-bold mb-1">{t('where')}:</Text>
                  <Text className="text-lg">{matchInfo.name}</Text>
                  <Text>{matchInfo.location}</Text>
                  <Text>{matchInfo.phone}</Text>
                </View>
                <View style={{flexDirection: 'row', marginTop: 6, gap: 8}}>
                  {(matchInfo.latitude !== 0 || matchInfo.longitude !== 0) && (
                    <Button
                      type="outline"
                      onPress={() =>
                        ShowLocation(matchInfo.latitude, matchInfo.longitude)
                      }
                      icon={
                        <Ionicons
                          name="location-outline"
                          size={18}
                          color="#4a90e2"
                        />
                      }>
                      {t('map')}
                    </Button>
                  )}
                  <Button
                    type="outline"
                    onPress={HandleShare}
                    icon={
                      <Ionicons
                        name="share-outline"
                        size={18}
                        color="#4a90e2"
                      />
                    }>
                    {t('share')}
                  </Button>
                </View>
              </View>
              {matchInfo.logo && (
                <View flex={1} className="items-center justify-center">
                  <Image
                    source={{uri: matchInfo.logo}}
                    width={100}
                    height={150}
                    resizeMode="contain"
                    style={{borderRadius: 8}}
                  />
                </View>
              )}
            </Row>
          </View>
        </Pressable>
      </Link>

      {/* Match Status and Actions */}
      <View>
        {/* Match Confirmed Section */}
        {matchInfo.home_confirmed > 0 && matchInfo.away_confirmed > 0 && (
          <View className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mb-3 border-t border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center mb-2">
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="green"
                style={{marginRight: 8}}
              />
              <Text className="font-bold">{t('match_confirmed')}</Text>
            </View>
            <Button
              type="outline"
              onPress={() => HandleUnconfirm()}
              icon={
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color="#f87171"
                />
              }>
              {t('unconfirm')}
            </Button>
          </View>
        )}

        {/* Waiting for Away Team */}
        {matchInfo.home_confirmed > 0 &&
          !matchInfo.away_confirmed &&
          matchInfo.player_team_id === matchInfo.home_team_id && (
            <View className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg mb-3 border-t border-gray-700 dark:border-gray-400">
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#d97706"
                  style={{marginRight: 8}}
                />
                <Text className="font-bold">
                  Waiting for away team to confirm
                </Text>
              </View>
              <Button
                type="outline"
                onPress={() => HandleUnconfirm()}
                icon={
                  <Ionicons
                    name="close-circle-outline"
                    size={18}
                    color="#f87171"
                  />
                }>
                {t('unconfirm')}
              </Button>
            </View>
          )}

        {/* Waiting for Home Team */}
        {matchInfo.away_confirmed > 0 &&
          !matchInfo.home_confirmed &&
          matchInfo.player_team_id === matchInfo.away_team_id && (
            <View className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg mb-3 border-t border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#d97706"
                  style={{marginRight: 8}}
                />
                <Text className="font-bold">
                  Waiting for home team to confirm
                </Text>
              </View>
              <Button
                type="outline"
                onPress={() => HandleUnconfirm()}
                icon={
                  <Ionicons
                    name="close-circle-outline"
                    size={18}
                    color="#f87171"
                  />
                }>
                {t('unconfirm')}
              </Button>
            </View>
          )}

        {/* Home team actions */}
        {!matchInfo.home_confirmed &&
          matchInfo.player_team_id === matchInfo.home_team_id &&
          (matchInfo.team_role_id > 0 || user.role_id === 9) && (
            <View className="my-3 border-t border-gray-200 dark:border-gray-700">
              <View className="my-2">
                {matchInfo.postponed_proposal &&
                  (!matchInfo.postponed_proposal?.isHome ? (
                    <Button
                      type="primary"
                      onPress={() => HandlePostpone()}
                      icon={
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color="white"
                        />
                      }
                      style={{marginBottom: 8}}>
                      {t('review_and_confirm')}
                    </Button>
                  ) : null)}
                {(typeof matchInfo?.postponed_proposal === 'undefined' ||
                  !matchInfo.postponed_proposal) && (
                  <Button
                    type="primary"
                    onPress={() => HandleConfirm()}
                    icon={
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color="white"
                      />
                    }
                    style={{marginBottom: 8}}>
                    {t('confirm_attendance')}
                  </Button>
                )}
              </View>
              {matchInfo.postponed_proposal?.newDate && (
                <View className="flex-row gap-2 items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <View className="flex-1">
                    <Text className="font-bold">
                      {matchInfo?.postponed_proposal?.isHome
                        ? matchInfo.home_team_short_name
                        : matchInfo.away_team_short_name}{' '}
                      {t('proposed_date')}:
                    </Text>
                    <Text>
                      {matchInfo.postponed_proposal?.newDate
                        ? DateTime.fromISO(
                            matchInfo.postponed_proposal.newDate,
                          ).toFormat('dd LLL yyyy hh:mm a')
                        : ''}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Button
                      type="outline"
                      onPress={() => HandlePostpone()}
                      icon={
                        <MaterialIcons
                          name="date-range"
                          size={20}
                          color="#4a90e2"
                        />
                      }>
                      {matchInfo.postponed_proposal && t('propose_new_date')}
                    </Button>
                  </View>
                </View>
              )}
              {!matchInfo.postponed_proposal?.newDate && (
                <Button
                  type="outline"
                  onPress={() => HandlePostpone()}
                  icon={
                    <MaterialIcons name="schedule" size={20} color="#4a90e2" />
                  }>
                  {t('reschedule')}
                </Button>
              )}
            </View>
          )}

        {/* Away team actions */}
        {!matchInfo.away_confirmed &&
          matchInfo.player_team_id === matchInfo.away_team_id &&
          (matchInfo.team_role_id > 0 || user.role_id === 9) && (
            <View className="my-3 border-t border-gray-700 dark:border-gray-400">
              <View className="my-2">
                {matchInfo.postponed_proposal?.isHome ? (
                  <Button
                    type="primary"
                    onPress={() => HandlePostpone()}
                    icon={
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="white"
                      />
                    }
                    style={{marginBottom: 8}}>
                    {t('review_and_confirm')}
                  </Button>
                ) : null}
                {(typeof matchInfo?.postponed_proposal === 'undefined' ||
                  !matchInfo.postponed_proposal) && (
                  <Button
                    type="primary"
                    onPress={() => HandleConfirm()}
                    icon={
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color="white"
                      />
                    }
                    style={{marginBottom: 8}}>
                    {t('confirm_attendance')}
                  </Button>
                )}
              </View>
              {matchInfo.postponed_proposal?.newDate && (
                <View className="flex-row gap-2 items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <View className="flex-1">
                    <Text className="font-bold">
                      {matchInfo?.postponed_proposal?.isHome
                        ? matchInfo.home_team_short_name
                        : matchInfo.away_team_short_name}{' '}
                      {t('proposed_date')}:
                    </Text>
                    <Text>
                      {matchInfo.postponed_proposal?.newDate
                        ? DateTime.fromISO(
                            matchInfo.postponed_proposal.newDate,
                          ).toFormat('dd LLL yyyy hh:mm a')
                        : ''}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Button
                      type="outline"
                      onPress={() => HandlePostpone()}
                      icon={
                        <MaterialIcons
                          name="date-range"
                          size={20}
                          color="#4a90e2"
                        />
                      }>
                      {matchInfo.postponed_proposal && t('propose_new_date')}
                    </Button>
                  </View>
                </View>
              )}
              {!matchInfo.postponed_proposal?.newDate && (
                <Button
                  type="outline"
                  onPress={() => HandlePostpone()}
                  icon={
                    <MaterialIcons name="schedule" size={20} color="#4a90e2" />
                  }>
                  {t('reschedule')}
                </Button>
              )}
            </View>
          )}
      </View>
    </View>
  )
}
