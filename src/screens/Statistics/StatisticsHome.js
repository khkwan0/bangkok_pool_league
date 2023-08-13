import React from 'react'
import {ScrollView, View} from 'react-native'
import {Text, TouchableRipple} from 'react-native-paper'

const StatisticsHome = props => {
  function ShowLeagueStandings() {
    props.navigation.navigate('League Standings')
  }

  function ShowTeamStats() {
    props.navigation.navigate('Team Statistics')
  }

  function ShowPlayerStats() {
    props.navigation.navigate('Player Statistics')
  }

  return (
    <ScrollView style={{margin: 20}}>
      <TouchableRipple onPress={() => ShowLeagueStandings()}>
        <View style={{padding: 40}}>
          <Text>League Standings</Text>
        </View>
      </TouchableRipple>
      <TouchableRipple onPress={() => ShowTeamStats()}>
        <View style={{padding: 40}}>
          <Text>Team Statistics</Text>
        </View>
      </TouchableRipple>
      <TouchableRipple onPress={() => ShowPlayerStats()}>
        <View style={{padding: 40}}>
          <Text>Player Statistics</Text>
        </View>
      </TouchableRipple>
    </ScrollView>
  )
}

export default StatisticsHome
