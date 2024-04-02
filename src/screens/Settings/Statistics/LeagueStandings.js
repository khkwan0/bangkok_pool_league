import React from 'react'
import {FlatList} from 'react-native'
import {useLeague, useYBase} from '~/lib/hooks'
import {TouchableRipple} from 'react-native-paper'
import {useNavigation} from '@react-navigation/native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {Row, Text, View} from '@ybase'

const MatchData = ({match}) => {
  const navigation = useNavigation()
  return (
    <Row alignItems="center">
      <View flex={1} alignItems="center">
        <Text>{match.home ? 'H' : 'A'}</Text>
      </View>
      <View flex={4}>
        <TouchableRipple
          onPress={() =>
            navigation.navigate('Statistics Match Screen', {
              matchId: match.matchId,
            })
          }>
          <Text bold variant="bodyMedium" style={{paddingVertical: 5}}>
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
    </Row>
  )
}

const TeamStandings = ({team, idx}) => {
  const [showAll, setShowAll] = React.useState(false)
  return (
    <View mx={20}>
      <Row alignItems="center">
        <View flex={4}>
          <TouchableRipple onPress={() => setShowAll(s => !s)}>
            <View style={{paddingVertical: 10}}>
              <Text bold fontSize="xl">
                {idx}&nbsp;
                {team.name}
              </Text>
            </View>
          </TouchableRipple>
        </View>
        <View flex={1}>
          <Text>{team.played}</Text>
        </View>
        <View flex={1}>
          <Text>{team.points}</Text>
        </View>
        <View flex={1}>
          <Text>{team.frames}</Text>
        </View>
      </Row>
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
  const {colors} = useYBase()
  return (
    <FlatList
      style={{backgroundColor: colors.background}}
      ListHeaderComponent={
        <View bgColor={colors.background} px={20} mt={10}>
          <View>
            <Text fontSize="xxl" bold color={colors.on}>
              {data.division}
            </Text>
          </View>
          <Row alignItems="center">
            <View flex={4} alignItems="center">
              <Text bold>Team</Text>
            </View>
            <View flex={1} alignItems="flex-start">
              <Text bold>Plyd</Text>
            </View>
            <View flex={1}>
              <Text bold>Pts</Text>
            </View>
            <View flex={1}>
              <Text bold>Frms</Text>
            </View>
          </Row>
        </View>
      }
      data={data.teams}
      renderItem={({item, index}) => (
        <TeamStandings team={item} idx={index + 1} />
      )}
    />
  )
}

const LeagueStandings = props => {
  const league = useLeague()
  const [standings, setStandings] = React.useState([])
  const insets = useSafeAreaInsets()

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
    <FlatList
      data={standings}
      renderItem={({item, index}) => <DivisionStandings data={item} />}
      ListFooterComponent={<View pb={insets.bottom} />}
    />
  )
}

export default LeagueStandings
