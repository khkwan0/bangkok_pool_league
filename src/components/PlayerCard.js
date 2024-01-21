import React from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Row, Text, View} from '@ybase'
import {useYBase} from '~/lib/hooks'
import {Image} from 'react-native'
import config from '~/config'

const PlayerCard = props => {
  const {t} = useTranslation()
  const {colors} = useYBase()

  function HandleSelect(playerId) {
    let newToTeam = false
    if (typeof props.newToTeam !== 'undefined' && props.newToTeam) {
      newToTeam = true
    }
    props.handleSelect(playerId, false, newToTeam)
  }

  return (
    <Row alignItems="center" p={10} bgColor={colors.playerRosterCardBackground}>
      <View flex={1.5}>
        <Text fontSize="lg">{props.player.name ?? props.player.nickname}</Text>
        <Row>
          {(props.player.firstname || props.player.firstName) && (
            <Text variant="bodyLarge">
              &nbsp;
              {props.abbrevFirst
                ? (props.player.firstname ?? props.player.firstName).substr(
                    0,
                    (props.player.firstname ?? props.player.firstName).length >
                      2
                      ? 3
                      : 2,
                  )
                : props.player.firstname}
            </Text>
          )}
          {(props.player.lastname || props.player.lastName) && (
            <Text variant="bodyLarge">
              &nbsp;
              {props.abbrevLast
                ? (props.player.lastname ?? props.player.lastName).substr(
                    0,
                    (props.player.lastname ?? props.player.lastName).length > 2
                      ? 3
                      : 2,
                  )
                : props.player.lastname}
            </Text>
          )}
        </Row>
      </View>
      <View flex={1}>
        {typeof props.player.profile_picture !== 'undefined' &&
          props.player.profile_picture && (
            <Image
              source={{uri: config.profileUrl + props.player.profile_picture}}
              width={50}
              height={50}
              resizeMode="contain"
              style={{borderRadius: 50}}
            />
          )}
      </View>
      <View flex={1}>
        <Button
          disabled={props.disabled}
          variant="outline"
          onPress={() =>
            HandleSelect(props.player.playerId ?? props.player.player_id)
          }>
          Select
        </Button>
      </View>
    </Row>
  )
}

export default PlayerCard
