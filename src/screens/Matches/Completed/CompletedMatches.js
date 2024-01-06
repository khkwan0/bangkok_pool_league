import React from 'react'
import {View, FlatList} from 'react-native'
import {Checkbox, Text} from 'react-native-paper'
import MatchDateCard from './components/MatchDateCard'
import {useSelector} from 'react-redux'
import {useSeason} from '~/lib/hooks'

const CompletedMatches = props => {
  const [dates, setDates] = React.useState([])
  const [filterPlayerOnly, setFilterPlayerOnly] = React.useState(false)
  const user = useSelector(_state => _state.userData).user
  const season = useSeason()

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
        query.push('completed=true')
        const res = await season.GetMatches(query)
        setDates(res)
      } catch (e) {
        console.log(e)
      }
    })()
  }, [user])

  function HandlePress(idx) {
    console.log(idx)
  }

  return (
    <View style={{flex: 1}}>
      <FlatList
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
