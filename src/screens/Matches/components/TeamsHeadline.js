import React from 'react'
import {View} from 'react-native'
import {ActivityIndicator, Text} from 'react-native-paper'

const TeamsHeadline = ({isLoading, matchInfo}) => {
  return (
    <View style={{backgroundColor: '#fff'}}>
      {isLoading && (
        <View style={{flex: 1, justifyContent: 'center'}}>
          <ActivityIndicator />
        </View>
      )}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            flex: 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text variant="headlineSmall" style={{textAlign: 'center'}}>
            {matchInfo.home_team_short_name}
          </Text>
        </View>
        <View style={{flex: 1, alignItems: 'center'}}>
          <Text>VS</Text>
        </View>
        <View
          style={{
            flex: 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text variant="headlineSmall" style={{textAlign: 'center'}}>
            {matchInfo.away_team_short_name}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default TeamsHeadline
