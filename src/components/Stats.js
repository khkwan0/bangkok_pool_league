import React from 'react'
import {Row, Text, View} from '@ybase'

const Stats = ({stats}) => {
  return (
    <>
      {Object.keys(stats).map((gameType, index) => {
        const margin = gameType === 'Total' ? 10 : 0
        const fw = gameType === 'Total' ? 'bold' : 'normal'
        return (
          <Row key={gameType + '_' + index} my={margin}>
            <View flex={2}>
              <Text style={{fontWeight: fw}}>{gameType}</Text>
            </View>
            <View flex={1}>
              <Text style={{fontWeight: fw}}>{stats[gameType].played}</Text>
            </View>
            <View flex={1}>
              <Text style={{fontWeight: fw}}>{stats[gameType].won}</Text>
            </View>
            <View flex={1}>
              <Text style={{fontWeight: fw}}>{stats[gameType].winp}</Text>
            </View>
            <View flex={1}>
              <Text style={{fontWeight: fw}}>{stats[gameType].wgtd}</Text>
            </View>
          </Row>
        )
      })}
    </>
  )
}

export default Stats
