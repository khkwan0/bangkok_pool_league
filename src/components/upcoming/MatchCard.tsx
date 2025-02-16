import React from 'react'
import {Image, Pressable} from 'react-native'
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

export default function MatchCard({matchInfo}: {matchInfo: MatchInfoDataType}) {
  const router = useRouter()

  const {t} = useTranslation()
  const {state} = useLeagueContext()
  const match = useMatch()
  const user = state.user

  React.useEffect(() => {
    if (typeof user?.teams !== 'undefined' && user.teams.length > 0) {
      let i = 0
      let found = false
      while (i < user.teams.length && !found) {
        if (user.teams[i].id === matchInfo.home_team_id) {
          const _matchInfo = {...matchInfo}
          _matchInfo.team_role_id = user.teams[i].team_role_id
          _matchInfo.player_team_id = matchInfo.home_team_id
          matchInfo = {..._matchInfo}
          found = true
        } else if (user.teams[i].id === matchInfo.away_team_id) {
          const _matchInfo = {...matchInfo}
          _matchInfo.team_role_id = user.teams[i].team_role_id
          _matchInfo.player_team_id = matchInfo.away_team_id
          matchInfo = {..._matchInfo}
          found = true
        }
        i++
      }
    }
  }, [])

  function ShowLocation(lat: number, long: number) {
    showLocation({
      latitude: lat,
      longitude: long,
    })
  }

  async function HandleConfirm() {
    const res = await match.ConfirmMatch(
      matchInfo.match_id,
      matchInfo.player_team_id,
    )
    if (res) {
      if (
        typeof res?.confirmed === 'number' &&
        res.confirmed &&
        typeof res?.isHome === 'boolean'
      ) {
        const _matchInfo = {...matchInfo}
        if (res.isHome) {
          _matchInfo.home_confirmed = res.confirmed
        } else {
          _matchInfo.away_confirmed = res.confirmed
        }
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

  console.log(
    matchInfo.away_confirmed,
    matchInfo.home_confirmed,
    matchInfo.team_role_id,
    matchInfo.player_team_id,
    matchInfo.postponed_proposal,
  )

  return (
    <View
      style={{
        margin: 10,
        padding: 10,
        borderRadius: 10,
      }}>
      <Link
        href={{pathname: '/Match', params: {params: JSON.stringify(matchInfo)}}}
        asChild>
        <Pressable>
          <View>
            <View>
              <Text type="subtitle" className="text-center">
                {matchInfo.home_team_short_name} vs{' '}
                {matchInfo.away_team_short_name}
              </Text>
              <Text type="subtitle" className="text-center">
                {DateTime.fromISO(matchInfo.date)
                  .setZone('Asia/Bangkok')
                  .toLocaleString(DateTime.DATE_HUGE)}
              </Text>
              {matchInfo.postponed_proposal?.newDate && !(matchInfo.home_confirmed && matchInfo.away_confirmed) && (
                <View style={{backgroundColor: 'red', padding: 10, borderRadius: 10}}>
                <Text type="subtitle"className="text-center">proposed_date</Text>
                <Text type="subtitle" className="text-center">
                  {DateTime.fromISO(matchInfo.postponed_proposal.newDate)
                  .setZone('Asia/Bangkok')
                  .toLocaleString(DateTime.DATE_HUGE)}
                </Text>
                </View>
              )}
            </View>
            <Row>
              <View flex={2}>
                <Text>Match ID: {matchInfo.match_id}</Text>
                <Text>Where:</Text>
                <Text>{matchInfo.name}</Text>
                <Text>{matchInfo.location}</Text>
                <Text>{matchInfo.phone}</Text>
                {(matchInfo.latitude !== 0 || matchInfo.longitude !== 0) && (
                  <View style={{flexDirection: 'row'}}>
                    <Button
                      type="outline"
                      onPress={() =>
                        ShowLocation(matchInfo.latitude, matchInfo.longitude)
                      }>
                      {t('map')}
                    </Button>
                  </View>
                )}
              </View>
              {matchInfo.logo && (
                <View flex={1}>
                  <Image
                    source={{uri: matchInfo.logo}}
                    width={100}
                    height={150}
                    resizeMode="contain"
                  />
                </View>
              )}
            </Row>
          </View>
        </Pressable>
      </Link>
      <View>
        {matchInfo.home_confirmed > 0 && matchInfo.away_confirmed > 0 && (
          <View>
            <Text>Match is confirmed</Text>
          </View>
        )}
        {matchInfo.home_confirmed > 0 &&
          !matchInfo.away_confirmed &&
          matchInfo.player_team_id === matchInfo.home_team_id && (
            <View>
              <Text>Waiting for away team to confirm</Text>
              <Button onPress={() => HandleUnconfirm()}>Unconfirm</Button>
            </View>
          )}
        {matchInfo.away_confirmed > 0 &&
          !matchInfo.home_confirmed &&
          matchInfo.player_team_id === matchInfo.away_team_id && (
            <View>
              <Text>Waiting for home team to confirm</Text>
              <Button onPress={() => HandleUnconfirm()}>Unconfirm</Button>
            </View>
          )}
        {!matchInfo.home_confirmed && !matchInfo.away_confirmed &&
          matchInfo.player_team_id === matchInfo.home_team_id &&
          (matchInfo.team_role_id > 0 || user.role_id === 9) && (
            <View className="my-2">
              <View className="my-2">
                {!matchInfo.postponed_proposal?.isHome ? (
                  <Button onPress={() => HandleConfirm()}>{t('confirm')}</Button>
                ) : null}
              </View>
              {matchInfo.postponed_proposal?.newDate && (
                <View className="flex-row gap-2 items-center">
                  <View className="flex-1">
                    <Text>{matchInfo.home_team_short_name} proposed date:</Text>
                    <Text>{matchInfo.postponed_proposal?.newDate ? DateTime.fromISO(matchInfo.postponed_proposal.newDate).toFormat('dd LLL yyyy hh:mm a') : ''}</Text>
                  </View>
                  <View className="flex-1">
                    <Button onPress={() => HandlePostpone()}>
                      {matchInfo.postponed_proposal && t('edit_date')}
                    </Button>
                  </View>
                </View>
              )}
              {!matchInfo.postponed_proposal?.newDate && (
                <Button onPress={() => HandlePostpone()}>{t('reschedule')}</Button>
              )}
            </View>
          )}
        {!matchInfo.away_confirmed && !matchInfo.home_confirmed &&
          matchInfo.player_team_id === matchInfo.away_team_id &&
          (matchInfo.team_role_id > 0 || user.role_id === 9) && (
            <View className="my-2">
              <View className="my-2">
                {matchInfo.postponed_proposal?.isHome ? (
                  <Button onPress={() => HandleConfirm()}>{t('confirm_proposed_date')}</Button>
                ) : null}
              </View>
              <View>
                <Button onPress={() => HandlePostpone()}>{t('propose_new_date')}</Button>
              </View>
            </View>
          )}
      </View>
    </View>
  )
}
