import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useMatchContext} from '@/context/MatchContext'
import {useMatch} from '@/hooks'
import {formatBangkokFromMillis} from '@/lib/bangkokTime'
import {useLocalSearchParams} from 'expo-router'
import {useNavigation} from 'expo-router/react-navigation'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {FlatList} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

type HistoryItem = {
  timestamp: number
  msg: string[]
}

function formatDate(timestamp: number) {
  return formatBangkokFromMillis(timestamp)
}

function resolveMatchId(
  params: unknown,
  contextMatchId: unknown,
): number | null {
  try {
    if (params != null) {
      const raw = typeof params === 'string' ? JSON.parse(params) : params
      const id = Number((raw as {match_id?: unknown})?.match_id)
      if (Number.isFinite(id) && id > 0) {
        return id
      }
    }
  } catch {
    // ignore malformed route params
  }

  const fallback = Number(contextMatchId)
  if (Number.isFinite(fallback) && fallback > 0) {
    return fallback
  }
  return null
}

export default function History() {
  const navigation = useNavigation()
  const {t} = useTranslation()
  const [history, setHistory] = React.useState<HistoryItem[]>([])
  const {params} = useLocalSearchParams()
  const match = useMatch()
  const insets = useSafeAreaInsets()
  const [refreshing, setRefreshing] = React.useState(false)
  const {state}: any = useMatchContext()
  const matchId = resolveMatchId(params, state?.matchInfo?.match_id)

  React.useEffect(() => {
    navigation.setOptions({title: t('history')})
  }, [navigation, t])

  const fetchMatch = React.useCallback(async () => {
    if (!matchId) {
      setHistory([])
      return
    }
    try {
      setRefreshing(true)
      const res = await match.GetMatchInfo(matchId)
      const _history = res?.data?.history ?? []
      const _historySorted = [..._history].sort(
        (a: HistoryItem, b: HistoryItem) => {
          if (a?.timestamp && b?.timestamp) {
            return b.timestamp - a.timestamp
          }
          return 0
        },
      )
      setHistory(_historySorted)
    } catch (error) {
      console.error('Error fetching match by ID:', error)
    } finally {
      setRefreshing(false)
    }
  }, [match, matchId])

  React.useEffect(() => {
    fetchMatch()
  }, [fetchMatch])

  return (
    <FlatList
      contentContainerStyle={{paddingBottom: insets.bottom}}
      data={history}
      refreshing={refreshing}
      onRefresh={() => fetchMatch()}
      renderItem={({item}) => {
        if (item !== null) {
          return (
            <View className="my-2 p-2">
              <Text>{formatDate(item.timestamp)}</Text>
              <Text>{item.msg}</Text>
            </View>
          )
        }
        return null
      }}
    />
  )
}
