import {ThemedText as Text} from '@/components/ThemedText'
import {useLeagueContext} from '@/context/LeagueContext'
import {Ionicons} from '@expo/vector-icons'
import {useNavigation, useRouter} from 'expo-router'
import {useTheme} from 'expo-router/react-navigation'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Pressable, useColorScheme, View} from 'react-native'

export default function PredictionsSettingsScreen() {
  const {t} = useTranslation()
  const navigation = useNavigation()
  const router = useRouter()
  const {colors} = useTheme()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const {state} = useLeagueContext()

  const muted = isDark ? 'rgba(226,232,240,0.65)' : 'rgba(51,65,85,0.7)'
  const cardBg = isDark ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.95)'
  const border = isDark ? 'rgba(148,163,184,0.25)' : 'rgba(15,23,42,0.08)'

  React.useEffect(() => {
    navigation.setOptions({title: t('predictions_settings')})
  }, [navigation, t])

  if (!state.predictionsEnabled) {
    return (
      <View style={{flex: 1, padding: 20, justifyContent: 'center'}}>
        <Text style={{textAlign: 'center', color: muted}}>
          {t('predictions_disabled_body')}
        </Text>
      </View>
    )
  }

  const Row = ({
    title,
    description,
    href,
    icon,
  }: {
    title: string
    description: string
    href: string
    icon: keyof typeof Ionicons.glyphMap
  }) => (
    <Pressable
      onPress={() => router.push(href as any)}
      style={({pressed}) => ({
        backgroundColor: cardBg,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: border,
        padding: 16,
        marginBottom: 12,
        opacity: pressed ? 0.9 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      })}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: 'rgba(14, 165, 233, 0.15)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Ionicons name={icon} size={22} color="#0EA5E9" />
      </View>
      <View style={{flex: 1}}>
        <Text style={{fontWeight: '700', color: colors.text, fontSize: 16}}>
          {title}
        </Text>
        <Text style={{color: muted, fontSize: 13, marginTop: 2}}>
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={muted} />
    </Pressable>
  )

  return (
    <View style={{flex: 1, padding: 16}}>
      <Text style={{color: muted, marginBottom: 16, fontSize: 14}}>
        {t('predictions_settings_description')}
      </Text>
      <Row
        title={t('predictions_leaderboard')}
        description={t('predictions_leaderboard_description')}
        href="/Settings/Predictions/Leaderboard"
        icon="trophy-outline"
      />
      <Row
        title={t('predictions_history')}
        description={t('predictions_history_description')}
        href="/Settings/Predictions/History"
        icon="list-outline"
      />
    </View>
  )
}
