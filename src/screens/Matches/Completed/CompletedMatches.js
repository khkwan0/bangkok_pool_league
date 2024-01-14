import React from 'react'
import {View, FlatList} from 'react-native'
import {Checkbox, Text} from 'react-native-paper'
import MatchDateCard from './components/MatchDateCard'
import {useSelector} from 'react-redux'
import {useSeason, useYBase} from '~/lib/hooks'

const CompletedMatches = props => {
  const [dates, setDates] = React.useState([])
  const [filterPlayerOnly, setFilterPlayerOnly] = React.useState(false)
  const user = useSelector(_state => _state.userData).user
  const season = useSeason()
  const {colors} = useYBase()

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

  return (
    <View flex={1} bgColor={colors.background}>
      <FlatList
        style={{backgroundColor: colors.background}}
        keyExtractor={(item, index) =>
          item.home_team_id + item.away_team_id + item.date + index
        }
        data={dates}
        renderItem={({item, index}) => (
          <MatchDateCard matchDate={item} idx={index} />
        )}
      />
    </View>
  )
}

export default CompletedMatches
