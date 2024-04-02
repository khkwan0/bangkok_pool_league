import React from 'react'
import {Row, Text, View} from '@ybase'

const MatchHeader = props => {
  let home_frames = 0
  let away_frames = 0

  props.matchData.forEach(frame => {
    if (frame.home_win === 1) {
      home_frames++
    } else {
      away_frames++
    }
  })

  return (
    <>
      <Row alignItems="center" mt={20}>
        <View flex={2}>
          <Text bold fontSize="xl" textAlign="center">
            {props.matchData[0].homeTeam.name}
          </Text>
        </View>
        <View flex={1}>
          <Text textAlign="center">vs</Text>
        </View>
        <View flex={2}>
          <Text bold fontSize="xl" textAlign="center">
            {props.matchData[0].awayTeam.name}
          </Text>
        </View>
      </Row>
      <Row alignItems="center" mt={20}>
        <View flex={1}>
          <Text textAlign="center" fontSize="xxxl" bold>
            {home_frames}
          </Text>
        </View>
        <View flex={1} />
        <View flex={1}>
          <Text textAlign="center" fontSize="xxxl" bold>
            {away_frames}
          </Text>
        </View>
      </Row>
    </>
  )
}

export default MatchHeader
