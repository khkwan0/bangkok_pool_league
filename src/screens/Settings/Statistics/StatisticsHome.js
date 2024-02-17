import React from 'react'
import {Pressable, Text, View} from '@ybase'
import {useYBase} from '~/lib/hooks'
import {ImageBackground} from 'react-native'

const StatisticsHome = props => {
  const {colors} = useYBase()

  function ShowLeagueStandings() {
    props.navigation.navigate('League Standings')
  }

  function ShowTeamStats() {
    props.navigation.navigate('Team Statistics')
  }

  function ShowPlayerStats() {
    props.navigation.navigate('Player Statistics Menu')
  }

  return (
    <View flex={1} bgColor={colors.background}>
      <ImageBackground
        source={require('../../../assets/img/bgs/bkkpool_logo.png')}
        style={{flex: 1, width: '100%', height: '100%'}}
        resizeMode="cover">
        <Pressable
          bgColor="#000b"
          borderRadius={0}
          flex={1}
          onPress={() => ShowLeagueStandings()}
          alignItems="center"
          justifyContent="center">
          <Text bold fontSize="xxl" color={colors.onPrimary}>
            league_standings
          </Text>
        </Pressable>
      </ImageBackground>
      <ImageBackground
        source={require('../../../assets/img/bgs/team.png')}
        style={{flex: 1, width: '100%', height: '100%', marginTop: 2}}
        resizeMode="cover">
        <Pressable
          flex={1}
          bgColor="#000a"
          borderRadius={0}
          onPress={() => ShowTeamStats()}
          alignItems="center"
          justifyContent="center">
          <Text bold fontSize="xxl" color={colors.onPrimary}>
            team_statistics
          </Text>
        </Pressable>
      </ImageBackground>
      <ImageBackground
        source={require('../../../assets/img/bgs/su.png')}
        style={{flex: 1, width: '100%', height: '100%', marginTop: 2}}
        resizeMode="cover">
        <Pressable
          bgColor="#000a"
          flex={1}
          borderRadius={0}
          onPress={() => ShowPlayerStats()}
          alignItems="center"
          justifyContent="center">
          <Text bold fontSize="xxl" color={colors.onPrimary}>
            player_statistics
          </Text>
        </Pressable>
      </ImageBackground>
    </View>
  )
}

export default StatisticsHome
