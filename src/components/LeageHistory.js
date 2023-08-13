import React from 'react'
import {View} from 'react-native'
import {Text} from 'react-native-paper'

const LeagueHistory = ({playerInfo}) => {
  return (
    <View>
      {Object.keys(playerInfo.seasons).map((season, seasonIdx) => {
        return (
          <View key={season + '_' + seasonIdx} style={{marginVertical: 5}}>
            {Object.keys(playerInfo.seasons[season]).map((team, teamIdx) => (
              <View
                key={team + '_' + teamIdx}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <View style={{flex: 2}}>
                  <Text>{team}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text>{season}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text>{playerInfo.seasons[season][team]} frames</Text>
                </View>
              </View>
            ))}
          </View>
        )
      })}
    </View>
  )
}

export default LeagueHistory
