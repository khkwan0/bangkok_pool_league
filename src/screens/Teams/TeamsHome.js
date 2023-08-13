import React from 'react'
import {FlatList, Pressable, View} from 'react-native'
import {Text} from 'react-native-paper'
import {useLeague} from '~/lib/hooks'
import {useNavigation} from '@react-navigation/native'

const TeamCard = ({team, idx}) => {
  const bgColor = idx % 2 ? '#eee' : '#fff'
  const navigation = useNavigation()

  function HandlePress() {
    navigation.navigate('Team', {team: team})
  }

  return (
    <Pressable onPress={() => HandlePress()}>
      <View style={{backgroundColor: bgColor, padding: 15}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View>
            <Text>{team.short_name}</Text>
            <Text>{team.division_short_name}</Text>
          </View>
          <View>
            <Text>{team.total_players} players &gt;</Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const TeamsHome = props => {
  const league = useLeague()
  const [teams, setTeams] = React.useState([])

  React.useEffect(() => {
    try {
      ;(async () => {
        const res = await league.GetTeams()
        setTeams(res)
      })()
    } catch (e) {
      console.log(e)
    }
  }, [])

  return (
    <FlatList
      data={teams}
      renderItem={({item, index}) => <TeamCard team={item} idx={index} />}
    />
  )
}

export default TeamsHome
