import React from 'react'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useLeague} from '@/hooks'
import {useTranslation} from 'react-i18next'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {Pressable} from 'react-native'
import Row from '@/components/Row'
import {useRouter} from 'expo-router'

export default function Info() {
  const router = useRouter()
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
    <View flex={1}>
      <View className="mt-2">
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/Settings/Info/PrivacyPolicy',
            })
          }
          className="py-2 px-2">
          <Row alignItems="center">
            <View flex={1}>
              <Text className="font-bold text-lg">privacy_policy</Text>
            </View>
            <View flex={1} alignItems="flex-end">
              <MCI name="chevron-right" size={30} />
            </View>
          </Row>
        </Pressable>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/Settings/Info/NineBallRules',
              params: {params: JSON.stringify({rules})},
            })
          }
          className="py-2 px-2">
          <Row alignItems="center">
            <View flex={1}>
              <Text className="font-bold text-lg">Nine Ball Rules</Text>
            </View>
            <View flex={1} alignItems="flex-end">
              <MCI name="chevron-right" size={30} />
            </View>
          </Row>
        </Pressable>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/Settings/Info/EightBallRules',
              params: {params: JSON.stringify({rules})},
            })
          }
          className="py-2 px-2">
          <Row alignItems="center">
            <View flex={1}>
              <Text className="font-bold text-lg">Eight Ball Rules</Text>
            </View>
            <View flex={1} alignItems="flex-end">
              <MCI name="chevron-right" size={30} />
            </View>
          </Row>
        </Pressable>
      </View>
    </View>
  )
}
