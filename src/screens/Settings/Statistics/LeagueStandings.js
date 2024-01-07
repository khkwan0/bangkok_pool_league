import React from 'react'
import {FlatList, View} from 'react-native'
import {useLeague} from '~/lib/hooks'
import {Text, TouchableRipple} from 'react-native-paper'
import {useNavigation} from '@react-navigation/native'

const MatchData = ({match}) => {
  const navigation = useNavigation()
  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <View style={{flex: 1, alignItems: 'center'}}>
        <Text>{match.home ? 'H' : 'A'}</Text>
      </View>
      <View style={{flex: 4}}>
        <TouchableRipple
          onPress={() =>
            navigation.navigate('Statistics Match Screen', {
              matchId: match.matchId,
            })
          }>
          <Text
            variant="bodyMedium"
            style={{fontWeight: 'bold', color: '#2c127a', paddingVertical: 5}}>
            {match.vs}
          </Text>
        </TouchableRipple>
      </View>
      <View style={{flex: 1}}>
        <Text>{match.pts}</Text>
      </View>
      <View style={{flex: 1}}>
        <Text>{match.frames}</Text>
      </View>
    </View>
  )
}

const TeamStandings = ({team, idx}) => {
  const [showAll, setShowAll] = React.useState(false)
  return (
    <View style={{marginHorizontal: 20}}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View
          style={{
            flex: 4,
          }}>
          <TouchableRipple onPress={() => setShowAll(s => !s)}>
            <View style={{paddingVertical: 10}}>
              <Text
                variant="bodyLarge"
                style={{fontWeight: 'bold', color: '#2c127a'}}>
                {idx}&nbsp;
                {team.name}
              </Text>
            </View>
          </TouchableRipple>
        </View>
        <View style={{flex: 1}}>
          <Text>{team.played}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text>{team.points}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text>{team.frames}</Text>
        </View>
      </View>
      {showAll && (
        <FlatList
          data={team.matches}
          renderItem={({item, index}) => <MatchData match={item} />}
        />
      )}
    </View>
  )
}

const DivisionStandings = ({data}) => {
  return (
    <View>
      <FlatList
        ListHeaderComponent={
          <View>
            <View style={{backgroundColor: '#eee', padding: 20}}>
              <Text variant="titleLarge">{data.division}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 20,
              }}>
              <View style={{flex: 4, alignItems: 'center'}}>
                <Text>Team</Text>
              </View>
              <View style={{flex: 1, alignItems: 'flex-start'}}>
                <Text>Plyd</Text>
              </View>
              <View style={{flex: 1}}>
                <Text>Pts</Text>
              </View>
              <View style={{flex: 1}}>
                <Text>Frms</Text>
              </View>
            </View>
          </View>
        }
        data={data.teams}
        renderItem={({item, index}) => (
          <TeamStandings team={item} idx={index + 1} />
        )}
      />
    </View>
  )
}

const LeagueStandings = props => {
  const league = useLeague()
  const [standings, setStandings] = React.useState([])

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await GetStandings()
        setStandings(res)
      } catch (e) {
        console.log(e)
      }
    })()
  }, [])

  async function GetStandings() {
    try {
      const res = await league.GetStandings()
      return res
    } catch (e) {
      return []
    }
  }

  return (
    <View>
      <FlatList
        data={standings}
        renderItem={({item, index}) => <DivisionStandings data={item} />}
      />
    </View>
  )
}

export default LeagueStandings
