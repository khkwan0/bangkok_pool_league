import React from 'react'
import {FlatList, RefreshControl} from 'react-native'
import {Button, Text, View} from '@ybase'
import MatchCard from './components/MatchCard'
import {useLeague, useSeason, useYBase} from '~/lib/hooks'
import {useSelector, useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {SetSeason} from '~/redux/seasonSlice'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import LiveScores from './components/LiveScores'
import AsyncStorage from '@react-native-async-storage/async-storage'

const UpcomingMatches = props => {
  const dispatch = useDispatch()
  const [fixtures, setFixtures] = React.useState([])
  const user = useSelector(_state => _state.userData).user
  const [refreshing, setRefreshing] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const [showMineOnly, setShowMineOnly] = React.useState(true)
  const [showPostponed, setShowPostponed] = React.useState(false)
  const [seasonNumber, setSeasonNumber] = React.useState('')
  const season = useSeason()
  const league = useLeague()
  const routeName = props.navigation.getState().routes[0].name
  const {colors} = useYBase()
  const {t} = useTranslation()

  async function GetSeason() {
    try {
      const _season = await league.GetSeason()
      dispatch(SetSeason(_season))
    } catch (e) {
      console.log(e)
    }
  }

  function HandlePress(idx) {
    props.navigation.navigate('Match Screen', {matchInfo: fixtures[idx]})
  }

  async function HandleScorePress(matchId) {
    try {
      const res = await league.GetMatchById(matchId)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        props.navigation.navigate('Match Screen', {matchInfo: res.data})
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
    } finally {
      setIsMounted(true)
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
              <View my={10} px={20}>
                <Button
                  variant="outline"
                  onPress={() =>
                    props.navigation.navigate('Login', {
                      previous: routeName,
                    })
                  }>
                  {t('login_to_see_your_matches')}
                </Button>
              </View>
            )}
            <LiveScores handlePress={HandleScorePress} />
            {(typeof user?.teams === 'undefined' || user.teams.length < 1) &&
              user.id && (
                <View py={10} px={20}>
                  <Text style={{textAlign: 'center'}}>
                    You are not affiliated with a team.
                  </Text>
                </View>
              )}
            {typeof user?.teams !== 'undefined' && user.teams.length > 0 && (
              <View mb={15} px={20}>
                <BouncyCheckbox
                  text={t('show_mine_only')}
                  textStyle={{textDecorationLine: 'none'}}
                  isChecked={showMineOnly}
                  onPress={() => setShowMineOnly(s => !s)}
                />
                <View mt={10}>
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
            <View my={30} px={20}>
              <Text textAlign="center" fontSize="xxxl">
                No upcoming matches for season: {seasonNumber}
              </Text>
            </View>
          ) : null
        }
        keyExtractor={(item, index) =>
          item.home_team_id + item.away_team_id + item.date + index
        }
        ItemSeparatorComponent={<View my={10} />}
        data={fixtures}
        renderItem={({item, index}) => (
          <MatchCard
            match={item}
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

export default UpcomingMatches
