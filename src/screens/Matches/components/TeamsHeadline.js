import React from 'react'
import {ActivityIndicator, Row, Text, View} from '@ybase'
import {useYBase} from '~/lib/hooks'

const TeamsHeadline = ({isLoading, matchInfo}) => {
  const {colors} = useYBase()
  return (
    <View bgColor={colors.background}>
      {isLoading && (
        <View flex={1} justifyContent="center">
          <ActivityIndicator />
        </View>
      )}
      <Row alignItems="center" justifyContent="center">
        <View flex={2} justifyContent="center" alignItems="center">
          <Text bold fontSize="md" textAlign="center">
            {matchInfo.home_team_short_name}
          </Text>
        </View>
        <View flex={1} alignItems="center">
          <Text>VS</Text>
        </View>
        <View flex={2} alignItems="center" justifyContent="center">
          <Text bold fontSize="md" textAlign="center">
            {matchInfo.away_team_short_name}
          </Text>
        </View>
      </Row>
    </View>
  )
}

export default TeamsHeadline
