import React from 'react'
import {FlatList} from 'react-native'
import {Text, View} from '@ybase'
import {useLeague, useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'

const Seasons = props => {
  const {colors} = useYBase()
  const {t} = useTranslation()
  const league = useLeague()
  const [season, setSeason] = React.useState(null)
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await league.GetSeasonV2()
        setSeason(res[0])
      } catch (e) {
        console.log(e)
      }
    })()
    return () => setIsMounted(false)
  }, [])

  React.useEffect(() => {
    if (season) {
      setIsMounted(true)
    }
  }, [season])

  if (isMounted) {
    return (
      <View flex={1} bgColor={colors.background} px={20}>
        <View flex={1} />
        <View flex={2}>
          <Text textAlign="center" fontSize="xxxl" bold>
            current_season
          </Text>
          <Text textAlign="center" bold fontSize={84}>
            {season.id}
          </Text>
        </View>
        <View flex={1} />
      </View>
    )
  } else {
    return <View flex={1} bgColor={colors.background} />
  }
}

export default Seasons
