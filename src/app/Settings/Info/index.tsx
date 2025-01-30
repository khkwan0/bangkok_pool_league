import React from 'react'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useLeague} from '@/hooks'
import {useTranslation} from 'react-i18next'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {Pressable, ScrollView} from 'react-native'
import Row from '@/components/Row'
import {useRouter} from 'expo-router'
import {useTheme, useNavigation} from '@react-navigation/native'

interface MenuItemProps {
  title: string
  icon: string
  onPress: () => void
}

export default function Info() {
  const router = useRouter()
  const [rules, setRules] = React.useState([])
  const league = useLeague()
  const {t} = useTranslation()
  const {colors} = useTheme()
  const navigation = useNavigation()

  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: t('info_and_guides'),
    })
  }, [navigation, t])

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

  const MenuItem = ({title, icon, onPress}: MenuItemProps) => (
    <Pressable
      onPress={onPress}
      className="py-4 px-4 mb-2 rounded-xl"
      style={{backgroundColor: colors.card}}>
      <Row alignItems="center">
        <View className="w-10">
          <MCI name={icon} size={24} color={colors.text} />
        </View>
        <View flex={1}>
          <Text className="font-bold text-lg">{title}</Text>
        </View>
        <MCI name="chevron-right" size={24} color={colors.text} />
      </Row>
    </Pressable>
  )

  return (
    <ScrollView className="flex-1 px-4 py-2">
      <View className="space-y-4">
        <MenuItem
          title={t('privacy_policy')}
          icon="shield-account"
          onPress={() =>
            router.push({
              pathname: '/Settings/Info/PrivacyPolicy',
            })
          }
        />
        <MenuItem
          title={t('nine_ball_rules')}
          icon="numeric-9-circle"
          onPress={() =>
            router.push({
              pathname: '/Settings/Info/NineBallRules',
              params: {params: JSON.stringify({rules})},
            })
          }
        />
        <MenuItem
          title={t('eight_ball_rules')}
          icon="numeric-8-circle"
          onPress={() =>
            router.push({
              pathname: '/Settings/Info/EightBallRules',
              params: {params: JSON.stringify({rules})},
            })
          }
        />
      </View>
    </ScrollView>
  )
}
