import React from 'react'
import {Button, Image, Pressable} from 'react-native'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import Row from '@/components/Row'
import {DateTime} from 'luxon'
import {showLocation} from 'react-native-map-link'
import {useTranslation} from 'react-i18next'
import {Link} from 'expo-router'
import {MatchInfoType} from '@/app/Match/types'

export default function MatchCard({matchInfo}: MatchInfoType) {
  const {t} = useTranslation()

  function ShowLocation(lat: number, long: number) {
    showLocation({
      latitude: lat,
      longitude: long,
    })
  }

  return (
    <View
      style={{
        margin: 10,
        padding: 10,
        borderRadius: 10,
      }}>
      <Link
        href={{pathname: '/Match', params: {params: JSON.stringify(matchInfo)}}}
        asChild>
        <Pressable>
          <View>
            <View>
              <Text type="subtitle" textAlign="center">
                {matchInfo.home_team_short_name} vs{' '}
                {matchInfo.away_team_short_name}
              </Text>
              <Text type="subtitle" textAlign="center">
                {DateTime.fromISO(matchInfo.date)
                  .setZone('Asia/Bangkok')
                  .toLocaleString(DateTime.DATE_HUGE)}
              </Text>
            </View>
            <Row>
              <View flex={2}>
                <Text>Match ID: {matchInfo.match_id}</Text>
                <Text>Where:</Text>
                <Text>{matchInfo.name}</Text>
                <Text>{matchInfo.location}</Text>
                <Text>{matchInfo.phone}</Text>
                {(matchInfo.latitude !== 0 || matchInfo.longitude !== 0) && (
                  <View style={{flexDirection: 'row'}}>
                    <Button
                      title={t('map')}
                      onPress={() =>
                        ShowLocation(matchInfo.latitude, matchInfo.longitude)
                      }
                    />
                  </View>
                )}
              </View>
              {matchInfo.logo && (
                <View flex={1}>
                  <Image
                    source={{uri: matchInfo.logo}}
                    width={100}
                    height={150}
                    resizeMode="contain"
                  />
                </View>
              )}
            </Row>
          </View>
        </Pressable>
      </Link>
    </View>
  )
}
