import React from 'react'
import {FlatList} from 'react-native'
import {ActivityIndicator, Button, Row, Text, View} from '@ybase'
import {TouchableRipple} from 'react-native-paper'
import {useLeague, useYBase} from '~/lib/hooks'
import {useNavigation} from '@react-navigation/native'

const PlayerCard = ({player, idx}) => {
  const {colors} = useYBase()
  const bgColor = idx % 2 ? colors.teamCard : colors.teamCardAlt
  const navigation = useNavigation()

  function HandlePress() {
    navigation.navigate('Player', {playerInfo: player})
  }

  return (
    <TouchableRipple onPress={() => HandlePress()}>
      <View style={{backgroundColor: bgColor, padding: 15}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{flex: 1}}>
            <Text>{player.flag}</Text>
          </View>
          <View style={{flex: 10}}>
            <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
              <Text>{player.name}</Text>
              <Text variant="bodySmall">
                ({player.firstname.substring(0, 1)} {player.lastname.substring(0, 1)})
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              {player.teams.map((team, index) => {
                if (index === player.teams.length - 1) {
                  return (
                    <Text
                      key={team + '_' + index}
                      variant="bodySmall"
                      style={{color: '#aaa'}}>
                      {team}
                    </Text>
                  )
                } else {
                  return (
                    <Text
                      key={team + '_' + index}
                      variant="bodySmall"
                      style={{color: '#aaa'}}>
                      {team},&nbsp;
                    </Text>
                  )
                }
              })}
            </View>
          </View>
          <View style={{flex: 1, alignItems: 'flex-end'}}>
            <Text>{player.total}</Text>
          </View>
        </View>
      </View>
    </TouchableRipple>
  )
}

const PlayersHome = props => {
  const league = useLeague()
  const [players, setPlayers] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [showActiveOnly, setShowActiveOnly] = React.useState(true)

  async function GetPlayers() {
    try {
      setIsLoading(true)
      const res = await league.GetPlayers(showActiveOnly)
      setPlayers(res)
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    GetPlayers()
  }, [showActiveOnly])

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator />
      </View>
    )
  } else {
    return (
      <FlatList
        ListHeaderComponent={
          <Row
            alignItems="center"
            justifyContent="space-between"
            m={10}
            px={20}>
            <Text>
              View: {showActiveOnly ? 'Active Players' : 'All Players'}
            </Text>
            <Button onPress={() => setShowActiveOnly(s => !s)}>
              Show {showActiveOnly ? 'All' : 'Active Only'}
            </Button>
          </Row>
        }
        data={players}
        keyExtractor={(item, index) => item.player_name + '_' + index}
        renderItem={({item, index}) => <PlayerCard player={item} idx={index} />}
      />
    )
  }
}

export default PlayersHome
