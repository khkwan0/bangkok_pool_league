import React from 'react'
import {Pressable, ScrollView, Text, View} from '@ybase'
import {useYBase} from '~/lib/hooks'

const StatisticsHome = props => {
  const {colors} = useYBase()
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
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 20,
        backgroundColor: colors.background,
        flexGrow: 1,
      }}>
      <Pressable onPress={() => ShowLeagueStandings()}>
        <View style={{padding: 40}}>
          <Text>League Standings</Text>
        </View>
      </Pressable>
      <Pressable onPress={() => ShowTeamStats()}>
        <View style={{padding: 40}}>
          <Text>Team Statistics</Text>
        </View>
      </Pressable>
      <Pressable onPress={() => ShowPlayerStats()}>
        <View style={{padding: 40}}>
          <Text>Player Statistics</Text>
        </View>
      </Pressable>
    </ScrollView>
  )
}

export default StatisticsHome
