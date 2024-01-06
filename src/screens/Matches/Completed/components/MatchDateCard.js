import React from 'react'
import {TouchableRipple} from 'react-native-paper'
import {DateTime} from 'luxon'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useNavigation} from '@react-navigation/native'
import {Divider, Text, View} from '@ybase'

const MatchDateCard = props => {
  const [showAll, setShowAll] = React.useState(props.showAll ? true : false)
  const navigation = useNavigation()

  return (
    <View style={{}}>
      <View>
        <TouchableRipple
          onPress={() => setShowAll(s => !s)}
          style={{
            margin: 10,
            padding: 10,
            backgroundColor: '#ddd',
            borderRadius: 10,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{flex: 1}} />
            <View style={{flex: 2}}>
              <Text style={{fontWeight: 'bold', textAlign: 'center'}}>
                {DateTime.fromISO(props.matchDate.date).toLocaleString(
                  DateTime.DATE_HUGE,
                )}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <MCI name="chevron-down" size={30} color="#000" />
            </View>
          </View>
        </TouchableRipple>
        {showAll &&
          props.matchDate.matches.map((match, idx) => (
            <TouchableRipple
              onPress={() =>
                navigation.navigate('Match Details', {
                  matchData: props.matchDate.matches[idx],
                })
              }
              key={'match' + idx}>
              <>
                <View style={{paddingVertical: 10}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <View style={{flex: 2}}>
                      <Text variant="titleMedium" style={{textAlign: 'center'}}>
                        {match.home_team_short_name}
                      </Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'center'}}>
                      <Text>vs</Text>
                    </View>
                    <View style={{flex: 2}}>
                      <Text variant="titleMedium" style={{textAlign: 'center'}}>
                        {match.away_team_short_name}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <View style={{flex: 2}}>
                      <Text variant="titleMedium" style={{textAlign: 'center'}}>
                        {match.home_frames}
                      </Text>
                    </View>
                    <View style={{flex: 1}} />
                    <View style={{flex: 2}}>
                      <Text variant="titleMedium" style={{textAlign: 'center'}}>
                        {match.away_frames}
                      </Text>
                    </View>
                  </View>
                </View>
                <Divider />
              </>
            </TouchableRipple>
          ))}
      </View>
    </View>
  )
}

export default MatchDateCard
