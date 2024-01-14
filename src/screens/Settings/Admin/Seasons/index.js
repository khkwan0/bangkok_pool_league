import React from 'react'
import {Button, Pressable, Row, ScrollView, Text, View} from '@ybase'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useTranslation} from 'react-i18next'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useLeague, useYBase} from '~/lib/hooks'

const Seasons = props => {
  const {colors} = useYBase()
  const league = useLeague()
  const {t} = useTranslation()
  const [season, setSeason] = React.useState(-1)
  const insets = useSafeAreaInsets()

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await league.GetSeason()
        console.log('here', res)
        setSeason(res)
      } catch (e) {
        console.log(e)
      }
    })()
  }, [])

  return (
    <ScrollView
      contentContainerStyle={{flex: 1, backgroundColor: colors.background}}>
      <View flex={1} px={20}>
        <View flex={1} />
        <View flex={3}>
          <Text bold textAlign="center" fontSize={84}>
            {t('season_number', {n: season})}
          </Text>
        </View>
        <View pb={Math.max(insets.bottom, 20)}>
          <Button
            onPress={() =>
              props.navigation.navigation('admin_seasons_new', {
                currentSeason: season,
              })
            }>
            {t('start_new_season')}
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}

export default Seasons
