import {useLeagueContext} from '@/context/LeagueContext'
import {
  useGoldenBreakReads,
  useGoldenBreaks,
} from '@/hooks/useGoldenBreaks'
import type {GoldenBreakItem} from '@/lib/goldenBreaks'
import {goldenBreakIsUnread} from '@/lib/goldenBreakReads'
import {Ionicons} from '@expo/vector-icons'
import {useRouter} from 'expo-router'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Pressable, Text, View} from 'react-native'

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

export function GoldenBreakCountBadge({count}: {count: number}) {
  if (count <= 0) return null
  const label = count > 9 ? '9+' : String(count)
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ef4444',
      }}>
      <Text style={{color: '#fff', fontSize: 10, fontWeight: '800'}}>
        {label}
      </Text>
    </View>
  )
}

export default function GoldenBreaksStatsSection({
  inset = true,
}: {
  inset?: boolean
}) {
  const router = useRouter()
  const {t} = useTranslation()
  const {state} = useLeagueContext()
  const {getGoldenBreaks} = useGoldenBreaks()
  const reads = useGoldenBreakReads()
  const [items, setItems] = React.useState<GoldenBreakItem[] | null>(null)

  React.useEffect(() => {
    if (state.sport === 'darts') return
    let cancelled = false
    ;(async () => {
      const res = await getGoldenBreaks({limit: 3})
      if (cancelled) return
      setItems(res && res.items.length > 0 ? res.items.slice(0, 3) : [])
    })()
    return () => {
      cancelled = true
    }
  }, [getGoldenBreaks, state.sport])

  if (state.sport === 'darts' || !items || items.length === 0) return null

  const unreadLabel =
    reads.unreadCount > 0
      ? t('golden_breaks_unread', {count: reads.unreadCount})
      : t('golden_breaks_title')

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={unreadLabel}
      onPress={() => router.push('/statistics/GoldenBreaks' as any)}
      style={{
        marginHorizontal: inset ? 16 : 0,
        marginTop: 8,
        marginBottom: 4,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E8A317',
        backgroundColor: 'rgba(232, 163, 23, 0.08)',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 6,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
        <Ionicons name="star" size={16} color="#B45309" />
        <Text style={{flex: 1, fontSize: 14, fontWeight: '800'}}>
          {t('golden_breaks_title')}
        </Text>
        <GoldenBreakCountBadge count={reads.unreadCount} />
        <Text style={{fontSize: 13, fontWeight: '700', color: '#B45309'}}>
          {t('golden_breaks_see_all')}
        </Text>
      </View>
      {items.map(item => {
        const unread = goldenBreakIsUnread(item.frameId, reads)
        return (
          <View
            key={item.frameId}
            style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
            {unread ? (
              <View
                accessibilityLabel={t('golden_breaks_new')}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#ef4444',
                }}
              />
            ) : (
              <View style={{width: 8}} />
            )}
            <Text numberOfLines={1} style={{flex: 1, fontSize: 13, opacity: 0.85}}>
              <Text style={{fontWeight: '700'}}>{namesOf(item)}</Text>
              {` · ${shortDate(item.matchDate)} · ${item.winnerTeamName}`}
            </Text>
          </View>
        )
      })}
    </Pressable>
  )
}
