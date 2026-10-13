import {ThemedText as Text} from '@/components/ThemedText'
import {
  usePredictions,
  type PredictionLeaderboardRow,
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

function displayName(row: PredictionLeaderboardRow) {
  if (row.nickname) return row.nickname
  const parts = [row.firstname, row.lastname].filter(Boolean)
  return parts.length ? parts.join(' ') : `#${row.player_id}`
}

export default function PredictionsLeaderboardScreen() {
  const {t} = useTranslation()
  const navigation = useNavigation()
  const {colors} = useTheme()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const predictions = usePredictions()

  const [rows, setRows] = React.useState<PredictionLeaderboardRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const muted = isDark ? 'rgba(226,232,240,0.65)' : 'rgba(51,65,85,0.7)'
  const cardBg = isDark ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.95)'
  const border = isDark ? 'rgba(148,163,184,0.25)' : 'rgba(15,23,42,0.08)'

  React.useEffect(() => {
    navigation.setOptions({title: t('predictions_leaderboard')})
  }, [navigation, t])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await predictions.getLeaderboard({limit: 50})
        if (!cancelled) setRows(data.rows)
      } catch {
        if (!cancelled) setError(t('predictions_leaderboard_load_failed'))
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
      data={rows}
      keyExtractor={item => String(item.player_id)}
      ListHeaderComponent={
        <Text style={{color: muted, marginBottom: 12, fontSize: 13}}>
          {t('predictions_scoring_help')}
        </Text>
      }
      ListEmptyComponent={
        <Text style={{textAlign: 'center', color: muted, marginTop: 40}}>
          {t('predictions_leaderboard_empty')}
        </Text>
      }
      renderItem={({item, index}) => (
        <View
          style={{
            backgroundColor: cardBg,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: border,
            padding: 14,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}>
          <Text
            style={{
              width: 28,
              fontWeight: '800',
              color: muted,
              fontSize: 16,
            }}>
            {index + 1}
          </Text>
          <View style={{flex: 1}}>
            <Text style={{fontWeight: '700', color: colors.text}}>
              {displayName(item)}
            </Text>
            <Text style={{color: muted, fontSize: 12, marginTop: 2}}>
              {t('predictions_leaderboard_stats', {
                exacts: item.exacts,
                winners: item.winners,
                picks: item.picks,
              })}
            </Text>
          </View>
          <Text style={{fontWeight: '800', color: colors.primary, fontSize: 18}}>
            {item.points}
          </Text>
        </View>
      )}
    />
  )
}
