import React from 'react'
import {useYBase} from '~/lib/hooks'
import {useSelector} from 'react-redux'
import {useNavigation} from '@react-navigation/native'
import {useTranslation} from 'react-i18next'
import {Button, Row, Text, View} from '@ybase'

const PlayerCard = props => {
  const player = props.player
  const idx = props.idx
  const {colors} = useYBase()
  const bgColor = idx % 2 ? colors.teamCard : colors.teamCardAlt
  const {t} = useTranslation()
  const user = useSelector(_state => _state.userData).user

  return (
    <View bgColor={bgColor} px={20} my={5}>
      <Row alignItems="center" justifyContent="space-between">
        <View flex={1}>
          <Text>{player.flag}</Text>
        </View>
        <View flex={2}>
          <Text bold>
            #{player.id} {player.nickname}
          </Text>
        </View>
        <View flex={4}>
          <Text>{player.firstname}</Text>
          <Text>{player.lastname}</Text>
        </View>
        {typeof user?.id !== 'undefined' && user.id && (
          <View flex={3}>
            <Button
              onPress={() =>
                props.navigation.navigate('Admin Player', {playerInfo: player})
              }
              variant="outline">
              {t('details')}
            </Button>
          </View>
        )}
      </Row>
    </View>
  )
}

export default PlayerCard
