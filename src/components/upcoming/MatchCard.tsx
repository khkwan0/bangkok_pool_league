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

export default function MatchCard(props: {matchInfo: MatchInfoDataType}) {
  const [matchInfo, setMatchInfo] = React.useState<MatchInfoDataType>(
    props.matchInfo,
  )
  const {t} = useTranslation()
  const {state} = useLeagueContext()
  const match = useMatch()
  const user = state.user

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
        setMatchInfo(_matchInfo)
      }
    }
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
        {matchInfo.home_confirmed && matchInfo.away_confirmed && (
          <View>
            <Text>Match is confirmed</Text>
          </View>
        )}
        {matchInfo.home_confirmed &&
          !matchInfo.away_confirmed &&
          matchInfo.player_team_id === matchInfo.home_team_id && (
            <View>
              <Text>Waiting for away team to confirm</Text>
              {user.role_id > 0 && (
                <Button onPress={() => HandleUnconfirm()}>Unconfirm</Button>
              )}
            </View>
          )}
        {matchInfo.away_confirmed &&
          !matchInfo.home_confirmed &&
          matchInfo.player_team_id === matchInfo.away_team_id && (
            <View>
              <Text>Waiting for home team to confirm</Text>
              {user.role_id > 0 && (
                <Button onPress={() => HandleUnconfirm()}>Unconfirm</Button>
              )}
            </View>
          )}
        {!matchInfo.home_confirmed &&
          matchInfo.player_team_id === matchInfo.home_team_id &&
          user.role_id > 0 && (
            <View>
              {user.role_id > 0 && (
                <Button onPress={() => HandleConfirm()}>Confirm</Button>
              )}
            </View>
          )}
        {!matchInfo.away_confirmed &&
          matchInfo.player_team_id === matchInfo.away_team_id &&
          user.role_id > 0 && (
            <View>
              {user.role_id > 0 && (
                <Button onPress={() => HandleConfirm()}>Confirm</Button>
              )}
            </View>
          )}
      </View>
    </View>
  )
}
