import React from 'react'
import {Pressable, Row, ScrollView, Text, View} from '@ybase'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useTranslation} from 'react-i18next'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useYBase} from '~/lib/hooks'

const Home = props => {
  const {colors} = useYBase()

  return (
    <ScrollView
      contentContainerStyle={{flex: 1, backgroundColor: colors.background}}>
      <View flex={1} px={20}>
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
        <Pressable onPress={() => props.navigation.navigate('admin_seasons')}>
          <Row alignItems="center">
            <View flex={1}>
              <Text>seasons</Text>
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

export default Home
