import {useGoldenBreaks} from '@/hooks/useGoldenBreaks'
import type {GoldenBreakItem} from '@/lib/goldenBreaks'
import {useRouter} from 'expo-router'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Pressable, Text, useColorScheme, View} from 'react-native'

function namesOf(item: GoldenBreakItem): string {
  if (item.players.length === 0) return item.winnerTeamName
  return item.players.map(player => player.nickname).join(' & ')
}

function shortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return dateStr
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export default function GoldenBreaksHome({
  refreshing = false,
}: {
  refreshing?: boolean
}) {
  const router = useRouter()
  const {t} = useTranslation()
  const isDark = useColorScheme() === 'dark'
  const {getGoldenBreaks} = useGoldenBreaks()
  const [items, setItems] = React.useState<GoldenBreakItem[] | null>(null)

  const loadedRef = React.useRef(false)

  React.useEffect(() => {
    if (loadedRef.current && !refreshing) return
    loadedRef.current = true
    let cancelled = false
    ;(async () => {
      const res = await getGoldenBreaks({limit: 3})
      if (cancelled) return
      setItems(res && res.items.length > 0 ? res.items.slice(0, 3) : [])
    })()
    return () => {
      cancelled = true
    }
  }, [getGoldenBreaks, refreshing])

  if (!items || items.length === 0) return null

  const ink = isDark ? '#F8FAFC' : '#3B2A00'
  const muted = isDark ? 'rgba(253, 230, 138, 0.8)' : '#7A4E00'

  return (
    <Pressable
      onPress={() => router.push('/GoldenBreaks' as any)}
      style={{
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? '#92400E' : '#F5D78A',
        backgroundColor: isDark ? '#3A2A10' : '#FFF6D8',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 6,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}>
        <Text style={{fontSize: 13, fontWeight: '800', color: ink}}>
          {t('golden_breaks_latest_short')}
        </Text>
        <Text style={{fontSize: 13, fontWeight: '700', color: '#B45309'}}>
          {t('golden_breaks_see_all')}
        </Text>
      </View>
      {items.map(item => (
        <Text
          key={item.frameId}
          numberOfLines={1}
          style={{fontSize: 13, color: muted}}>
          <Text style={{fontWeight: '700', color: ink}}>{namesOf(item)}</Text>
          {` · ${shortDate(item.matchDate)} · ${item.winnerTeamName}`}
        </Text>
      ))}
    </Pressable>
  )
}
