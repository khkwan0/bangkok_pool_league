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

  console.log(
    matchInfo?.away_confirmed,
    matchInfo?.home_confirmed,
    matchInfo?.team_role_id,
    matchInfo?.player_team_id,
    matchInfo?.postponed_proposal,
  )

  if (!isMounted || !matchInfo) return null

  return (
    <View
      style={{
        margin: 10,
        padding: 10,
        borderRadius: 10,
      }}>
      <Link
        href={{
          pathname: '/Match',
          params: {params: JSON.stringify(matchInfo)},
        }}
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
              {matchInfo.postponed_proposal?.newDate &&
                !(matchInfo.home_confirmed && matchInfo.away_confirmed) && (
                  <View
                    style={{
                      backgroundColor: 'red',
                      padding: 10,
                      borderRadius: 10,
                    }}>
                    <Text type="subtitle" className="text-center">
                      proposed_date
                    </Text>
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
            <Text>match_confirmed</Text>
            <Button onPress={() => HandleUnconfirm()}>Unconfirm</Button>
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
        {/* Home team */}
        {!matchInfo.home_confirmed &&
          matchInfo.player_team_id === matchInfo.home_team_id &&
          (matchInfo.team_role_id > 0 || user.role_id === 9) && (
            <View className="my-2">
              <View className="my-2">
                {matchInfo.postponed_proposal &&
                  (!matchInfo.postponed_proposal?.isHome ? (
                    <Button onPress={() => HandlePostpone()}>
                      {t('review_and_confirm')}
                    </Button>
                  ) : null)}
                {(typeof matchInfo?.postponed_proposal === 'undefined' ||
                  !matchInfo.postponed_proposal) && (
                  <Button onPress={() => HandleConfirm()}>
                    {t('confirm')}
                  </Button>
                )}
              </View>
              {matchInfo.postponed_proposal?.newDate && (
                <View className="flex-row gap-2 items-center">
                  <View className="flex-1">
                    <Text>
                      {matchInfo?.postponed_proposal?.isHome
                        ? matchInfo.home_team_short_name
                        : matchInfo.away_team_short_name}{' '}
                      proposed date:
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
                    <Button onPress={() => HandlePostpone()}>
                      {matchInfo.postponed_proposal && t('propose_new_date')}
                    </Button>
                  </View>
                </View>
              )}
              {!matchInfo.postponed_proposal?.newDate && (
                <Button onPress={() => HandlePostpone()}>
                  {t('reschedule')}
                </Button>
              )}
            </View>
          )}
        {/* Away team */}
        {!matchInfo.away_confirmed &&
          matchInfo.player_team_id === matchInfo.away_team_id &&
          (matchInfo.team_role_id > 0 || user.role_id === 9) && (
            <View className="my-2">
              <View className="my-2">
                {matchInfo.postponed_proposal?.isHome ? (
                  <Button onPress={() => HandlePostpone()}>
                    {t('review_and_confirm')}
                  </Button>
                ) : null}
                {(typeof matchInfo?.postponed_proposal === 'undefined' ||
                  !matchInfo.postponed_proposal) && (
                  <Button onPress={() => HandleConfirm()}>
                    {t('confirm')}
                  </Button>
                )}
              </View>
              {matchInfo.postponed_proposal?.newDate && (
                <View className="flex-row gap-2 items-center">
                  <View className="flex-1">
                    <Text>
                      {matchInfo?.postponed_proposal?.isHome
                        ? matchInfo.home_team_short_name
                        : matchInfo.away_team_short_name}{' '}
                      proposed date:
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
                    <Button onPress={() => HandlePostpone()}>
                      {matchInfo.postponed_proposal && t('propose_new_date')}
                    </Button>
                  </View>
                </View>
              )}
              {!matchInfo.postponed_proposal?.newDate && (
                <Button onPress={() => HandlePostpone()}>
                  {t('reschedule')}
                </Button>
              )}
            </View>
          )}
      </View>
    </View>
  )
}
