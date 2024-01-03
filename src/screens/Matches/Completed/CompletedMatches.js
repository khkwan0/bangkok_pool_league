import React from 'react'
import {View, FlatList} from 'react-native'
import {Checkbox, Text} from 'react-native-paper'
import MatchDateCard from './components/MatchDateCard'
import {useAppSelector} from '~/lib/hooks/redux'
import {useSeason} from '~/lib/hooks'

const CompletedMatches = props => {
  const [dates, setDates] = React.useState([])
  const [filterPlayerOnly, setFilterPlayerOnly] = React.useState(false)
  const {user} = useAppSelector(_state => _state.user)
  const season = useSeason()

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
        query.push('completed=true')
        const res = await season.GetMatches(query)
        setDates(res)
      } catch (e) {
        console.log(e)
      }
    })()
  }, [user])

  function HandlePress(idx) {
  }

  return (
    <View style={{flex: 1}}>
      <FlatList
        ListHeaderComponent={
          <View>
            {user.data.id && (
              <Checkbox
                status={filterPlayerOnly ? 'checked' : 'unchecked'}
                onPress={() => setFilterPlayerOnly(s => !s)}
              />
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
        data={dates}
        renderItem={({item, index}) => (
          <MatchDateCard
            matchDate={item}
            idx={index}
            handlePress={HandlePress}
          />
        )}
      />
    </View>
  )
}

export default CompletedMatches
