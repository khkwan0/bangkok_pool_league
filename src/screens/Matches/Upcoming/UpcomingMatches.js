import React from 'react'
import {View, FlatList} from 'react-native'
import {Button, Text} from 'react-native-paper'
import MatchCard from './components/MatchCard'
import {useAppSelector} from '~/lib/hooks/redux'
import {useSeason} from '~/lib/hooks'

const UpcomingMatches = props => {
  const [fixtures, setFixtures] = React.useState([])
  const {user} = useAppSelector(_state => _state.user)
  const season = useSeason()
  const routeName = props.navigation.getState().routes[0].name

  React.useEffect(() => {
    ;(async () => {
      const query = []
      try {
        if (
          typeof user?.data?.teams === 'undefined' ||
          !user.data.teams ||
          user.data.teams.length === 0
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
            {!user.data.id && (
              <Button
                onPress={() =>
                  props.navigation.navigate('Login', {
                    previous: routeName,
                  })
                }>
                Login to see your matches
              </Button>
            )}
            {(typeof user?.data?.teams === 'undefined' ||
              user.data.teams.length < 1) &&
              user.data.id && (
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
