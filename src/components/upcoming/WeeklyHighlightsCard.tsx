import config from '@/config'
import {useWeeklyHighlights} from '@/hooks/useWeeklyHighlights'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {router} from 'expo-router'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Image, Pressable, ScrollView, useColorScheme} from 'react-native'
import type {
  WeeklyHighlightPlayer,
  WeeklyHighlights,
  WeeklySpotlight,
} from '@/types/weeklyHighlights'

const SPOTLIGHT_I18N: Record<string, string> = {
  hot_hand: 'weekly_spotlight_hot_hand',
  perfect_night: 'weekly_spotlight_perfect_night',
  iron_man: 'weekly_spotlight_iron_man',
  doubles_star: 'weekly_spotlight_doubles_star',
  ton_machine: 'weekly_spotlight_ton_machine',
  closer: 'weekly_spotlight_closer',
  golden_break: 'weekly_spotlight_golden_break',
}

function formatNightDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function Avatar({
  player,
  size = 52,
}: {
  player: WeeklyHighlightPlayer
  size?: number
}) {
  const uri = player.pic ? config.profileUrl + player.pic : null
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: '#CFCFCF',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {uri ? (
        <Image
          source={{uri}}
          style={{width: size, height: size}}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text style={{fontWeight: '700', fontSize: size * 0.4}}>
          {(player.nickname || '?').slice(0, 1).toUpperCase()}
        </Text>
      )}
    </View>
  )
}

function openPlayer(playerId: number) {
  router.push({
    pathname: '/statistics/PlayerStatistics/Player' as any,
    params: {params: JSON.stringify({playerId})},
  })
}

function SpotlightRow({
  spotlight,
  label,
}: {
  spotlight: WeeklySpotlight
  label: string
}) {
  return (
    <Pressable
      onPress={() => openPlayer(spotlight.player.playerId)}
      style={{
        minWidth: 140,
        marginRight: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: 'rgba(255,255,255,0.7)',
      }}>
      <Text style={{fontSize: 11, opacity: 0.6, fontWeight: '600'}}>
        {label}
      </Text>
      <Text style={{fontWeight: '700', marginTop: 2}} numberOfLines={1}>
        {spotlight.player.nickname}
      </Text>
      <Text style={{fontSize: 12, opacity: 0.65}} numberOfLines={1}>
        {spotlight.detail}
      </Text>
    </Pressable>
  )
}

export default function WeeklyHighlightsCard() {
  const {t} = useTranslation()
  const {getWeeklyHighlights} = useWeeklyHighlights()
  const colorScheme = useColorScheme()
  const [data, setData] = React.useState<WeeklyHighlights | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await getWeeklyHighlights()
        if (!cancelled) setData(res)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [getWeeklyHighlights])

  if (loading || !data?.playerOfTheWeek) return null

  const potw = data.playerOfTheWeek
  const cardBg = colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF'
  const border = colorScheme === 'dark' ? '#37003C' : '#E0E0E0'

  return (
    <View
      className="mx-4 mb-3 rounded-xl p-3"
      style={{
        backgroundColor: cardBg,
        borderWidth: 1,
        borderColor: border,
      }}>
      <Text style={{fontSize: 12, opacity: 0.6, fontWeight: '600'}}>
        {t('player_of_the_week')}
      </Text>
      <Text style={{fontSize: 12, opacity: 0.5, marginBottom: 8}}>
        {t('match_night')} · {formatNightDate(data.matchDate)}
      </Text>

      <Pressable
        onPress={() => openPlayer(potw.playerId)}
        className="flex-row items-center"
        style={{gap: 12}}>
        <Avatar player={potw} size={56} />
        <View style={{flex: 1}}>
          <Text style={{fontSize: 18, fontWeight: '700'}} numberOfLines={1}>
            {potw.nickname}
          </Text>
          {potw.team ? (
            <Text style={{opacity: 0.65}} numberOfLines={1}>
              {potw.team.shortName || potw.team.name}
            </Text>
          ) : null}
          <Text style={{opacity: 0.55, marginTop: 2}}>
            {potw.won}–{potw.lost}
            {potw.played > 0 ? ` · ${potw.winPct}%` : ''}
          </Text>
        </View>
      </Pressable>

      {data.spotlights.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{marginTop: 12}}>
          {data.spotlights.map(s => (
            <SpotlightRow
              key={s.id}
              spotlight={s}
              label={t(SPOTLIGHT_I18N[s.id] || s.label)}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  )
}
