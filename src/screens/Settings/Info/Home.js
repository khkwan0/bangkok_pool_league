import React from 'react'
import {Pressable, Row, Text, View} from '@ybase'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'

const Home = props => {
  const {colors} = useYBase()
  const {t} = useTranslation()

  return (
    <View flex={1} bgColor={colors.background} px={20}>
      <View mt={20}>
        <Pressable onPress={() => props.navigation.navigate('Privacy Policy')}>
          <Row alignItems="center">
            <View flex={1}>
              <Text bold fontSize="lg">
                privacy_policy
              </Text>
            </View>
            <View flex={1} alignItems="flex-end">
              <MCI name="chevron-right" size={30} color={colors.onSurface} />
            </View>
          </Row>
        </Pressable>
      </View>
    </View>
  )
}

export default Home
