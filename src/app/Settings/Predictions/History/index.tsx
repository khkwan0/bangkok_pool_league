import {ThemedText as Text} from '@/components/ThemedText'
import {
  usePredictions,
  type MatchPrediction,
} from '@/hooks/usePredictions'
import {useNavigation} from 'expo-router'
import {useTheme} from 'expo-router/react-navigation'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  ActivityIndicator,
  FlatList,
  useColorScheme,
  View,
} from 'react-native'

function formatWhen(raw?: string | null) {
  if (!raw) return ''
  try {
    return new Date(raw).toLocaleDateString()
  } catch {
    return String(raw)
  }
}

export default function PredictionsHistoryScreen() {
  const {t} = useTranslation()
  const navigation = useNavigation()
  const {colors} = useTheme()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const predictions = usePredictions()

  const [items, setItems] = React.useState<MatchPrediction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const muted = isDark ? 'rgba(226,232,240,0.65)' : 'rgba(51,65,85,0.7)'
  const cardBg = isDark ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.95)'
  const border = isDark ? 'rgba(148,163,184,0.25)' : 'rgba(15,23,42,0.08)'

  React.useEffect(() => {
    navigation.setOptions({title: t('predictions_history')})
  }, [navigation, t])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await predictions.listMine({limit: 50})
        if (cancelled) return
        if (res.error) setError(t('predictions_history_load_failed'))
        setItems(res.items)
      } catch {
        if (!cancelled) setError(t('predictions_history_load_failed'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={{flex: 1, padding: 20, justifyContent: 'center'}}>
        <Text style={{textAlign: 'center', color: muted}}>{error}</Text>
      </View>
    )
  }

  return (
    <FlatList
      style={{flex: 1}}
      contentContainerStyle={{padding: 16, paddingBottom: 40}}
      data={items}
      keyExtractor={item => String(item.id)}
      ListEmptyComponent={
        <Text style={{textAlign: 'center', color: muted, marginTop: 40}}>
          {t('predictions_history_empty')}
        </Text>
      }
      renderItem={({item}) => {
        const side =
          item.predicted_side === 'home'
            ? t('predictions_home')
            : t('predictions_away')
        const matchup = [
          item.home_team_short_name || '?',
          item.away_team_short_name || '?',
        ].join(' vs ')
        const result =
          item.home_frames != null && item.away_frames != null
            ? `${item.home_frames}-${item.away_frames}`
            : null
        return (
          <View
            style={{
              backgroundColor: cardBg,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: border,
              padding: 14,
              marginBottom: 8,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 8,
              }}>
              <Text
                style={{fontWeight: '700', color: colors.text, flex: 1}}
                numberOfLines={1}>
                {matchup}
              </Text>
              <Text style={{fontWeight: '700', color: colors.primary}}>
                {item.status === 'scored'
                  ? t('predictions_points', {count: item.points})
                  : t(`predictions_status_${item.status}`)}
              </Text>
            </View>
            <Text style={{color: muted, fontSize: 13, marginTop: 4}}>
              {t('predictions_history_tip', {
                side,
                margin: item.predicted_margin,
              })}
              {result ? ` · ${t('predictions_result', {score: result})}` : ''}
            </Text>
            <Text style={{color: muted, fontSize: 12, marginTop: 4}}>
              {formatWhen(item.match_date || item.created_at)}
            </Text>
          </View>
        )
      }}
    />
  )
}
