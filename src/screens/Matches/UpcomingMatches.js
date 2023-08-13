import React from 'react'
import {View, FlatList} from 'react-native'
import {Button} from 'react-native-paper'
import MatchCard from '@components/MatchCard'
import {useAppSelector} from '~/lib/hooks/redux'
import {useSeason} from '~/lib/hooks'

const UpcomingMatches = props => {
  const [fixtures, setFixtures] = React.useState([])
  const {user} = useAppSelector(_state => _state.user)
  const season = useSeason()
  const routeName = props.navigation.getState().routes[0].name

  React.useEffect(() => {
    ;(async () => {
      try {
        const matches = await season.GetMatches(['newonly=1'])
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
