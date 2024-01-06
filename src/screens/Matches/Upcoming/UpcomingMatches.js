import React from 'react'
import {View, FlatList} from 'react-native'
import {Button, Text} from 'react-native-paper'
import MatchCard from './components/MatchCard'
import {useSeason} from '~/lib/hooks'
import {useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'

const UpcomingMatches = props => {
  const [fixtures, setFixtures] = React.useState([])
  const user = useSelector(_state => _state.userData).user
  const season = useSeason()
  const routeName = props.navigation.getState().routes[0].name
  const {t} = useTranslation()

  React.useEffect(() => {
    ;(async () => {
      const query = []
      try {
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
      }
    })()
  }, [user])

  function HandlePress(idx) {
    props.navigation.navigate('Match Screen', {matchInfo: fixtures[idx]})
  }

  return (
    <View style={{flex: 1}}>
      <FlatList
        ListHeaderComponent={
          <View>
            {!user.id && (
              <Button
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
        data={fixtures}
        renderItem={({item, index}) => (
          <MatchCard match={item} idx={index} handlePress={HandlePress} />
        )}
      />
    </View>
  )
}

export default UpcomingMatches
