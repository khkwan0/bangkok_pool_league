import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import Row from '@/components/Row'
import {MatchInfoType} from '../types'

export default function VSHeader({matchInfo}: MatchInfoType) {
  return (
    <Row>
      <View flex={3}>
        <Text textAlign="right" type="title">
          {matchInfo.home_team_short_name}
        </Text>
      </View>
      <View flex={1}>
        <Text textAlign="center">VS</Text>
      </View>
      <View flex={3}>
        <Text textAlign="left" type="title">
          {matchInfo.away_team_short_name}
        </Text>
      </View>
    </Row>
  )
}
