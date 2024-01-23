import React from 'react'
import {FlatList, RefreshControl} from 'react-native'
import {Button, Text, View} from '@ybase'
import MatchCard from './components/MatchCard'
import {useLeague, useSeason, useYBase} from '~/lib/hooks'
import {useSelector, useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {SetSeason} from '~/redux/seasonSlice'
import BouncyCheckbox from 'react-native-bouncy-checkbox'

const UpcomingMatches = props => {
  const dispatch = useDispatch()
  const [fixtures, setFixtures] = React.useState([])
  const user = useSelector(_state => _state.userData).user
  const [refreshing, setRefreshing] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const [showMineOnly, setShowMineOnly] = React.useState(true)
  const [seasonNumber, setSeasonNumber] = React.useState('')
  const season = useSeason()
  const league = useLeague()
  const routeName = props.navigation.getState().routes[0].name
  const {t} = useTranslation()
  const {colors} = useYBase()

  /*
  const onRefresh = React.useCallback(async () => {
    const query = []
    try {
      setRefreshing(true)
      let showAll = false
      console.log(user?.teams?.length)
      if (
        typeof user?.teams === 'undefined' ||
        !user.teams ||
        user.teams.length === 0
      ) {
        showAll = true
      } else if (!showMineOnly) {
        showAll = false
      }
      if (showAll) {
        query.push('noteam=true')
      } else {
        query.push('noteam=false')
      }
      query.push('newonly=true')
      console.log(query)
      const matches = await season.GetMatches(query)
      setFixtures(matches)
      const _season = await league.GetSeason()
      dispatch(SetSeason(_season))
      setSeasonNumber(_season)
    } catch (e) {
      console.log(e)
    } finally {
      setRefreshing(false)
      setIsMounted(true)
    }
  }, [])
  */


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

  async function GetMatches(filtered = false) {
    try {
      setRefreshing(true)
      const query = []
      if (filtered) {
        query.push('noteam=false')
      } else {
        query.push('noteam=true')
      }
      query.push('newonly=true')
      const res = await season.GetMatches(query)
      setFixtures(res)
    } catch (e) {
      console.log(e)
    } finally {
      setRefreshing(false)
      setIsMounted(true)
    }
  }

  React.useEffect(() => {
    GetSeason()
  }, [])

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
  }, [showMineOnly])

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

  if (isMounted) {
    return (
      <View flex={1} bgColor={colors.background} px={20}>
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={GetMatches} />
          }
          ListHeaderComponent={
            <View>
              {!user.id && (
                <Button
                  variant="ghost"
                  onPress={() =>
                    props.navigation.navigate('Login', {
                      previous: routeName,
                    })
                  }>
                  {t('login_to_see_your_matches')}
                </Button>
              )}
              {(typeof user?.teams === 'undefined' || user.teams.length < 1) &&
                user.id && (
                  <View style={{paddingVertical: 10}}>
                    <Text style={{textAlign: 'center'}}>
                      You are not affiliated with a team.
                    </Text>
                  </View>
                )}
              {typeof user?.teams !== 'undefined' && user.teams.length > 0 && (
                <View my={20}>
                  <BouncyCheckbox
                    text={t('show_mine_only')}
                    textStyle={{textDecorationLine: 'none'}}
                    isChecked={showMineOnly}
                    onPress={() => setShowMineOnly(s => !s)}
                  />
                </View>
              )}
            </View>
          }
          ListFooterComponent={
            isMounted && fixtures.length === 0 ? (
              <View my={30}>
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
      </View>
    )
  } else {
    return null
  }
}

export default UpcomingMatches
