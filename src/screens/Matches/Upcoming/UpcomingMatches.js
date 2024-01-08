import React from 'react'
import {FlatList, RefreshControl} from 'react-native'
import {Button, Text, View} from '@ybase'
import MatchCard from './components/MatchCard'
import {useSeason, useYBase} from '~/lib/hooks'
import {useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'

const UpcomingMatches = props => {
  const [fixtures, setFixtures] = React.useState([])
  const user = useSelector(_state => _state.userData).user
  const [refreshing, setRefreshing] = React.useState(false)
  const season = useSeason()
  const routeName = props.navigation.getState().routes[0].name
  const {t} = useTranslation()
  const {colors} = useYBase()

  const onRefresh = React.useCallback(async () => {
    const query = []
    try {
      setRefreshing(true)
      if (
        typeof user?.teams === 'undefined' ||
        !user.teams ||
        user.teams.length === 0
      ) {
        query.push('noteam=true')
      }
      query.push('newonly=true')
      const matches = await season.GetMatches(query)
      setFixtures(matches)
    } catch (e) {
      console.log(e)
    } finally {
      setRefreshing(false)
    }
  }, [])

  React.useEffect(() => {
    onRefresh()
  }, [user])

  function HandlePress(idx) {
    props.navigation.navigate('Match Screen', {matchInfo: fixtures[idx]})
  }

  return (
    <View flex={1} bgColor={colors.background} px={20}>
      <FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
            {(typeof user?.data?.teams === 'undefined' ||
              user.teams.length < 1) &&
              user.id && (
                <View style={{paddingVertical: 10}}>
                  <Text style={{textAlign: 'center'}}>
                    You are not affiliated with a team.
                  </Text>
                </View>
              )}
          </View>
        }
        keyExtractor={(item, index) =>
          item.home_team_id + item.away_team_id + item.date + index
        }
        ItemSeparatorComponent={<View my={10} />}
        data={fixtures}
        renderItem={({item, index}) => (
          <MatchCard match={item} idx={index} handlePress={HandlePress} />
        )}
      />
    </View>
  )
}

export default UpcomingMatches
