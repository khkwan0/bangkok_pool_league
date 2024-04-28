import React from 'react'
import {Pressable, Row, Text, View} from '@ybase'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useLeague, useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'

const Home = props => {
  const {colors} = useYBase()
  const {t} = useTranslation()
  const [rules, setRules] = React.useState([])
  const league = useLeague()

  async function GetRules() {
    try {
      const res = await league.GetRules()
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        setRules(res.data)
      }
    } catch (e) {
      console.log(e)
    }
  }
  React.useEffect(() => {
    GetRules()
  }, [])

  return (
    <View flex={1} bgColor={colors.background} px={20}>
      <View mt={20}>
        <Pressable
          onPress={() => props.navigation.navigate('Privacy Policy')}
          py={5}
          px={20}>
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
        <Pressable
          onPress={() =>
            props.navigation.navigate('Nine Ball Rules', {rules: rules})
          }
          py={5}
          px={20}>
          <Row alignItems="center">
            <View flex={1}>
              <Text bold fontSize="lg">
                Nine Ball Rules
              </Text>
            </View>
            <View flex={1} alignItems="flex-end">
              <MCI name="chevron-right" size={30} color={colors.onSurface} />
            </View>
          </Row>
        </Pressable>
        <Pressable
          onPress={() =>
            props.navigation.navigate('Eight Ball Rules', {rules: rules})
          }
          py={5}
          px={20}>
          <Row alignItems="center">
            <View flex={1}>
              <Text bold fontSize="lg">
                Eight Ball Rules
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
