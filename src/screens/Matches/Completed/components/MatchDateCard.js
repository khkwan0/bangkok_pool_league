import React from 'react'
import {TouchableRipple} from 'react-native-paper'
import {DateTime} from 'luxon'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useNavigation} from '@react-navigation/native'
import {Divider, Row, Text, View} from '@ybase'
import {useYBase} from '~/lib/hooks'

const MatchDateCard = props => {
  const [showAll, setShowAll] = React.useState(props.showAll ? true : false)
  const navigation = useNavigation()
  const {colors} = useYBase()
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    let _count = 0
    props.matchDate.matches.forEach(match => {
      if (
        match.match_status_id === 1 &&
        DateTime.fromISO(match.match_date).toMillis() < Date.now()
      ) {
        _count++
      }
      setCount(_count)
    })
  }, [])

  return (
    <View>
      <TouchableRipple
        onPress={() => setShowAll(s => !s)}
        style={{
          margin: 10,
          padding: 10,
          backgroundColor: colors.matchCardBackground,
          borderRadius: 10,
        }}>
        <Row alignItems="center">
          <View flex={1} />
          <View flex={3}>
            <Text textAlign="center" bold color={colors.onSurface}>
              {DateTime.fromISO(props.matchDate.date).toLocaleString(
                DateTime.DATE_HUGE,
              )}
            </Text>
          </View>
          <View flex={1}>
            <MCI name="chevron-down" size={30} color={colors.onSurface} />
          </View>
          {count > 0 && (
            <View flex={1}>
              <Text
                p={5}
                borderRadius={25}
                maxWidth={30}
                textAlign="center"
                color="#fff"
                bold
                bgColor={colors.error}>
                {count}
              </Text>
            </View>
          )}
        </Row>
      </TouchableRipple>
      {showAll &&
        props.matchDate.matches.map((match, idx) => {
          return (
            <TouchableRipple
              onPress={() =>
                match.match_status_id === 1
                  ? navigation.navigate('Post Match Screen', {
                      matchInfo: match,
                      fromCompleted: true,
                    })
                  : navigation.navigate('Match Details', {
                      matchData: props.matchDate.matches[idx],
                    })
              }
              key={'match' + idx}>
              <>
                <View py={10} px={20}>
                  <Row alignItems="center">
                    <View flex={2}>
                      <Text bold fontSize="xl" textAlign="center">
                        {match.home_team_short_name
                          ? match.home_team_short_name
                          : match.home_team_name}
                      </Text>
                    </View>
                    <View flex={1} alignItems="center">
                      <Text>vs</Text>
                    </View>
                    <View flex={2}>
                      <Text fontSize="xl" bold textAlign="center">
                        {match.away_team_short_name
                          ? match.away_team_short_name
                          : match.away_team_name}
                      </Text>
                    </View>
                  </Row>
                  {match.match_status_id === 1 &&
                    DateTime.fromISO(match.match_date).toMillis() <
                      Date.now() && (
                      <View alignItems="center" justifyContent="center">
                        <MCI
                          name="alert-circle"
                          color={colors.error}
                          size={30}
                        />
                      </View>
                    )}
                  {match.match_status_id === 3 && (
                    <Row alignItems="center">
                      <View flex={2}>
                        <Text textAlign="center" fontSize="xxxl">
                          {match.home_frames}
                        </Text>
                      </View>
                      <View flex={1} />
                      <View flex={2}>
                        <Text textAlign="center" fontSize="xxxl">
                          {match.away_frames}
                        </Text>
                      </View>
                    </Row>
                  )}
                </View>
                <Divider />
              </>
            </TouchableRipple>
          )
        })}
    </View>
  )
}

export default MatchDateCard
