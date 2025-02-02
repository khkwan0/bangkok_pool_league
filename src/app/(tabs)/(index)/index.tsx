import React from 'react'
import {FlatList, RefreshControl} from 'react-native'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import MatchCard from '@/components/upcoming/MatchCard'
import {useLeague, useSeason, useAccount} from '@/hooks'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import LiveScores from '@/components/upcoming/LiveScores'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {useLeagueContext} from '@/context/LeagueContext'
import {useTranslation} from 'react-i18next'
import {useTheme} from '@react-navigation/native'
import {useRouter, usePathname} from 'expo-router'
import Button from '@/components/Button'
import {MaterialIcons} from '@expo/vector-icons'

interface ItemType {
  home_team_id: number
  away_team_id: number
  date: string
}
export default function UpcomingMatches(props: any) {
  const {colors} = useTheme()
  const {state, dispatch}: any = useLeagueContext()
  const [fixtures, setFixtures] = React.useState([])
  const user = state.user
  const [refreshing, setRefreshing] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const [showMineOnly, setShowMineOnly] = React.useState(true)
  const [showPostponed, setShowPostponed] = React.useState(false)
  const [seasonNumber, setSeasonNumber] = React.useState('')
  const season = useSeason()
  const league = useLeague()
  const account = useAccount()
  const {t} = useTranslation()
  const [needsUpdate, setNeedsUpdate] = React.useState(false)
  const router = useRouter()

  const pathname = usePathname()

  async function GetSeason() {
    try {
      const _season = await league.GetSeason()
      dispatch({type: 'SET_SEASON', payload: _season})
    } catch (e) {
      console.log(e)
    }
  }

  async function FetchUser() {
    try {
      console.log('Fetching user')
      await account.FetchUser()
    } catch (e) {
      console.log(e)
    } finally {
      setIsMounted(true)
    }
  }

  async function CheckVersion() {
    setNeedsUpdate(await account.CheckVersion())
  }

  function HandlePress(idx: number) {
    router.push({pathname: '/Match', params: fixtures[idx]})
  }

  async function HandleScorePress(matchId: number) {
    try {
      const res = await league.GetMatchById(matchId)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        router.push({
          pathname: '/Match',
          params: {params: JSON.stringify(res.data)},
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  async function GetMatches(filtered = false, postponed = false) {
    try {
      setRefreshing(true)
      const query = []
      if (filtered) {
        query.push('noteam=false')
      } else {
        query.push('noteam=true')
      }
      if (postponed) {
        query.push('newonly=false')
      } else {
        query.push('newonly=true')
      }
      const res = await season.GetMatches(query)
      setFixtures(res)
    } catch (e) {
      console.log(e)
    } finally {
      setRefreshing(false)
    }
  }

  React.useEffect(() => {
    GetSeason()
  }, [])

  React.useEffect(() => {
    FetchUser()
  }, [])

  React.useEffect(() => {
    if (typeof user?.teams !== 'undefined' && user.teams.length > 0) {
      if (showMineOnly) {
        if (showPostponed) {
          GetMatches(true, true)
        } else {
          GetMatches(true, false)
        }
      } else {
        if (showPostponed) {
          GetMatches(false, true)
        } else {
          GetMatches(false, false)
        }
      }
    } else {
      GetMatches(false, false)
    }
  }, [showMineOnly, showPostponed, user])
  /*
  React.useEffect(() => {
    if (
      typeof user?.teams !== 'undefined' &&
      user.teams.length > 0 &&
      showMineOnly
    ) {
      GetMatches(true)
    } else {
      GetMatches(false)
    }
  }, [user])
  */

  async function HandleSavePostponedOption() {
    try {
      await AsyncStorage.setItem(
        'postponed',
        JSON.stringify({showPostponed: showPostponed}),
      )
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    if (isMounted) {
      HandleSavePostponedOption()
    }
  }, [showPostponed])
  async function HandleTogglePostponed() {
    setShowPostponed(s => !s)
  }

  async function HandleGetPostponedOption() {
    try {
      const res = await AsyncStorage.getItem('postponed')
      if (res) {
        const _res = JSON.parse(res)
        setShowPostponed(_res.showPostponed)
      }
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    HandleGetPostponedOption()
  }, [])

  if (isMounted) {
    return (
      <FlatList
        contentContainerStyle={{
          backgroundColor: colors.background,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              if (typeof user?.teams !== 'undefined' && user.teams.length > 0) {
                if (showMineOnly) {
                  if (showPostponed) {
                    GetMatches(true, true)
                  } else {
                    GetMatches(true, false)
                  }
                } else {
                  if (showPostponed) {
                    GetMatches(false, true)
                  } else {
                    GetMatches(false, false)
                  }
                }
              } else {
                GetMatches(false, false)
              }
            }}
          />
        }
        ListHeaderComponent={
          <>
            {!user.id && (
              <View className="my-4 mx-6">
                <Button onPress={() => router.push({pathname: '/Auth', params: {from: pathname}})}>
                  {t('login_to_see_your_matches')}
                </Button>
              </View>
            )}
            <LiveScores handlePress={HandleScorePress} />
            {(typeof user?.teams === 'undefined' || user.teams.length < 1) &&
              user.id && (
                <View className="my-2 mx-2">
                  <Text style={{textAlign: 'center'}}>
                    You are not affiliated with a team.
                  </Text>
                </View>
              )}
            {typeof user?.teams !== 'undefined' && user.teams.length > 0 && (
              <View className="mb-1 mx-3 mt-1 p-5" style={{borderRadius: 10}}>
                <BouncyCheckbox
                  text={t('show_mine_only')}
                  textStyle={{textDecorationLine: 'none'}}
                  isChecked={showMineOnly}
                  onPress={() => setShowMineOnly(s => !s)}
                />
                <View className="mt-6">
                  <BouncyCheckbox
                    text={t('show_postponed')}
                    textStyle={{textDecorationLine: 'none'}}
                    isChecked={showPostponed}
                    onPress={() => HandleTogglePostponed()}
                  />
                </View>
              </View>
            )}
          </>
        }
        ListFooterComponent={
          isMounted && fixtures.length === 0 ? (
            <View className="p-6 rounded-2xl shadow-sm items-center mx-20">
              <MaterialIcons
                name="event-available"
                size={48}
                color="#6b7280"
                className="mb-4"
              />
              <Text className="text-lg text-gray-500 text-center mb-6">
                {t('no_upcoming_matches_for_season', {season: state.season})}
              </Text>
            </View>
          ) : null
        }
        keyExtractor={(item: ItemType, index) =>
          item.home_team_id + item.away_team_id + item.date + index
        }
        ItemSeparatorComponent={() => <View className="my-5" />}
        data={fixtures}
        renderItem={({item, index}) => (
          <MatchCard
            matchInfo={item}
            idx={index}
            handlePress={HandlePress}
            showMineOnly={showMineOnly}
          />
        )}
      />
    )
  } else {
    return null
  }
}
