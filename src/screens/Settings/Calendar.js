import React from 'react'
import {FlatList, StyleSheet, View} from 'react-native'
import {ActivityIndicator, Text} from 'react-native-paper'
import {useSeason, useLeague} from '~/lib/hooks'

const winnerStyle = StyleSheet.create({
  fontWeight: 'bold',
  color: '#00b',
  fontSize: 18,
})

const loserStyle = StyleSheet.create({
  fontWeight: 'bold',
  color: '#b00',
  fontSize: 16,
})

const tiedStyle = StyleSheet.create({
  fontWeight: 'bold',
  fontSize: 16,
})

const marginStyle = StyleSheet.create({
  marginLeft: 4,
  borderLeftWidth: 2,
  borderLeftColor: '#aaa',
  paddingLeft: 10,
})

const MatchGrouping = props => {
  const matchDate = Object.keys(props.matches)[0]
  return (
    <View style={{marginLeft: 5}}>
      <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
        <Text style={{color: '#aaa'}}>&#x2b24;</Text>
        <Text variant="headlineMedium" style={{color: '#000'}}>
          {matchDate}
        </Text>
      </View>
      {Object.keys(props.matches[matchDate]).map((divisionName, idx) => {
        return (
          <View key={divisionName + matchDate + idx}>
            <View style={[marginStyle, {paddingLeft: 20}]}>
              <Text>{divisionName}</Text>
            </View>
            <View>
              {props.matches[matchDate][divisionName].map((match, idx) => {
                const homeStyle =
                  match.home_frames > match.away_frames
                    ? winnerStyle
                    : match.away_frames === match.home_frames
                    ? tiedStyle
                    : loserStyle
                const awayStyle =
                  match.away_frames > match.home_frames
                    ? winnerStyle
                    : match.away_frames === match.home_frames
                    ? tiedStyle
                    : loserStyle

                return (
                  <View
                    key={match.id + '_' + idx}
                    style={[marginStyle, {paddingLeft: 40}]}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        gap: 10,
                        alignItems: 'center',
                      }}>
                      <Text style={homeStyle}>{match.home_short_name}</Text>
                      <Text>VS</Text>
                      <Text style={awayStyle}>{match.away_short_name}</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        )
      })}
    </View>
  )
}

const Calendar = props => {
  const season = useSeason()
  const league = useLeague()
  const [matches, setMatches] = React.useState([])
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      try {
        const _season = await league.GetSeason()
        const res = await season.GetMatchesBySeason(_season)
        setMatches(res.matches)
      } catch (e) {
        console.log(e)
      } finally {
        setIsMounted(true)
      }
    })()
  }, [])

  if (isMounted) {
    return (
      <View>
        <FlatList
          data={matches}
          initialNumToRender={2}
          renderItem={({item}) => <MatchGrouping matches={item} />}
        />
      </View>
    )
  } else {
    return <ActivityIndicator />
  }
}

export default Calendar
