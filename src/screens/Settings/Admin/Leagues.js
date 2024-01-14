import React from 'react'
import {Pressable, Row, ScrollView, Text, View} from '@ybase'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useTranslation} from 'react-i18next'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useLeague, useYBase} from '~/lib/hooks'

const Leagues = props => {
  const {colors} = useYBase()
  const league = useLeague()
  const {t} = useTranslation()

  const season = React.useMemo(async () => {
    const res = await league.getSeasons()
    return res
  }, [])

  return (
    <ScrollView
      contentContainerStyle={{flex: 1, backgroundColor: colors.background}}>
      <View flex={1} px={20}>
        <View>
          <Text>{t('season_number', {n: season})}</Text>
        </View>
        <Pressable onPress={() => props.navigation.navigate('admin_teams')}>
          <Row alignItems="center">
            <View flex={1}>
              <Text>teams</Text>
            </View>
            <View flex={1}>
              <MCI name="chevron-right" size={30} color={colors.onSurface} />
            </View>
          </Row>
        </Pressable>
        <Pressable onPress={() => props.navigation.navigate('admin_season')}>
          <Row alignItems="center">
            <View flex={1}>
              <Text>season</Text>
            </View>
            <View flex={1}>
              <MCI name="chevron-right" size={30} color={colors.onSurface} />
            </View>
          </Row>
        </Pressable>
      </View>
    </ScrollView>
  )
}

export default Leagues
