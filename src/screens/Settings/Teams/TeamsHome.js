import React from 'react'
import {FlatList, Pressable, View} from 'react-native'
import {Text} from '@ybase'
import {useLeague, useYBase} from '~/lib/hooks'
import {useNavigation} from '@react-navigation/native'

const TeamCard = ({team, idx}) => {
  const {colors} = useYBase()
  const bgColor = idx % 2 ? colors.teamCard : colors.teamCardAlt
  const navigation = useNavigation()

  function HandlePress() {
    navigation.navigate('Team', {team: team})
  }

  return (
    <Pressable onPress={() => HandlePress()}>
      <View style={{backgroundColor: bgColor, padding: 15}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View>
            <Text>{team.name}</Text>
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
  const {colors} = useYBase()
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
      contentContainerStyle={{backgroundColor: colors.background}}
      data={teams}
      renderItem={({item, index}) => <TeamCard team={item} idx={index} />}
    />
  )
}

export default TeamsHome
