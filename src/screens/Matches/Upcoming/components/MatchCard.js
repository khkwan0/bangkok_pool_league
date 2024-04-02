import React from 'react'
import {Image} from 'react-native'
import {DateTime} from 'luxon'
import {showLocation} from 'react-native-map-link'
import {useTranslation} from 'react-i18next'
import {useYBase} from '~/lib/hooks'
import {Pressable, Row, Text, View} from '@ybase'

const MatchCard = props => {
  const {t} = useTranslation()
  const {colors, theme} = useYBase()

  function ShowLocation(lat, long) {
    showLocation({
      latitude: lat,
      longitude: long,
    })
  }

  return (
    <View
      mx={20}
      p={10}
      bgColor={colors.matchCardBackground}
      borderRadius={theme.roundness}>
      <Pressable onPress={() => props.handlePress(props.idx)}>
        <View>
          <Text>{props.match.round}</Text>
          <Text textAlign="center" bold>
            {props.match.home_team_short_name
              ? props.match.home_team_short_name
              : props.match.home_team_name}{' '}
            {t('vs')}{' '}
            {props.match.away_team_short_name
              ? props.match.away_team_short_name
              : props.match.away_team_name}{' '}
          </Text>
          {DateTime.fromISO(props.match.date).startOf('day') <
            DateTime.now().startOf('day') && (
            <Text textAlign="center" bold color={colors.error}>
              MAKE UP MATCH
            </Text>
          )}
          <Text variant="titleMedium" style={{textAlign: 'center'}}>
            {DateTime.fromISO(props.match.date).toLocaleString(
              DateTime.DATE_HUGE,
            )}
          </Text>
          <Row>
            <View flex={2}>
              <Text>{t('where')}:</Text>
              <Text>{props.match.name}</Text>
              <Text>{props.match.location}</Text>
              <Text>{props.match.phone}</Text>
            </View>
            <View flex={1} />
          </Row>
          {(props.match.latitude !== 0 || props.match.longitude !== 0) && (
            <Row>
              <Pressable
                borderWidth={1}
                borderRadius={10}
                p={10}
                onPress={() =>
                  ShowLocation(props.match.latitude, props.match.longitude)
                }>
                <Text bold size="lg">
                  {t('map')}
                </Text>
              </Pressable>
            </Row>
          )}
          {props.match.logo && (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 10,
                zIndex: -1,
              }}>
              <Image
                source={{uri: props.match.logo}}
                width={100}
                height={100}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </Pressable>
    </View>
  )
}

export default MatchCard
