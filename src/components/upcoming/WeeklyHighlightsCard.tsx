import config from '@/config'
import {useWeeklyHighlights} from '@/hooks/useWeeklyHighlights'
import {ThemedText as Text} from '@/components/ThemedText'
import {
  loadHomeHighlightsCollapsed,
  saveHomeHighlightsCollapsed,
} from '@/lib/homeHighlightsCollapsed'
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons'
import {LinearGradient} from 'expo-linear-gradient'
import {router} from 'expo-router'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native'
import type {
  HighlightGameTypeOption,
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

const SPOTLIGHT_ICON: Record<
  string,
  React.ComponentProps<typeof MaterialCommunityIcons>['name']
> = {
  hot_hand: 'fire',
  perfect_night: 'star-circle',
  iron_man: 'dumbbell',
  doubles_star: 'account-multiple',
  ton_machine: 'bullseye-arrow',
  closer: 'target',
  golden_break: 'billiards',
}

function getTheme(isDark: boolean) {
  if (isDark) {
    return {
      gradient: ['#2A102F', '#1A0A1E', '#141018'] as const,
      border: 'rgba(232, 198, 240, 0.22)',
      title: '#F8FAFC',
      muted: 'rgba(226,232,240,0.65)',
      accent: '#E8C6F0',
      accentSoft: 'rgba(232, 198, 240, 0.14)',
      chipBg: 'rgba(255,255,255,0.06)',
      chipBorder: 'rgba(148,163,184,0.25)',
      chipActiveBg: '#F8FAFC',
      chipActiveText: '#1A0A1E',
      heroBg: 'rgba(0,0,0,0.22)',
      heroBorder: 'rgba(232, 198, 240, 0.18)',
      ring: '#F5D76E',
      ringOuter: 'rgba(245, 215, 110, 0.28)',
      pillBg: 'rgba(245, 215, 110, 0.16)',
      pillText: '#F5D76E',
      spotlightBg: 'rgba(255,255,255,0.06)',
      spotlightBorder: 'rgba(148,163,184,0.2)',
      moreBg: 'rgba(255,255,255,0.1)',
      moreBorder: 'rgba(248,250,252,0.28)',
    }
  }
  return {
    gradient: ['#4A1054', '#37003C', '#2A002E'] as const,
    border: 'rgba(55, 0, 60, 0.35)',
    title: '#FFFFFF',
    muted: 'rgba(255,255,255,0.72)',
    accent: '#F3D9F8',
    accentSoft: 'rgba(255,255,255,0.12)',
    chipBg: 'rgba(255,255,255,0.12)',
    chipBorder: 'rgba(255,255,255,0.22)',
    chipActiveBg: '#FFFFFF',
    chipActiveText: '#37003C',
    heroBg: 'rgba(0,0,0,0.18)',
    heroBorder: 'rgba(255,255,255,0.16)',
    ring: '#F5D76E',
    ringOuter: 'rgba(245, 215, 110, 0.35)',
    pillBg: 'rgba(245, 215, 110, 0.2)',
    pillText: '#FFE9A8',
    spotlightBg: 'rgba(255,255,255,0.12)',
    spotlightBorder: 'rgba(255,255,255,0.2)',
    moreBg: 'rgba(255,255,255,0.16)',
    moreBorder: 'rgba(255,255,255,0.3)',
  }
}

function formatWeekDay(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatWeekRange(weekStart: string, weekEnd: string): string {
  return `${formatWeekDay(weekStart)} – ${formatWeekDay(weekEnd)}`
}

function gameTypeLabel(
  opt: HighlightGameTypeOption,
  t: (key: string) => string,
): string {
  if (opt.code === 'all') return t('weekly_highlights_all')
  return opt.label
}

function Avatar({
  player,
  size = 52,
  ring,
  ringOuter,
}: {
  player: WeeklyHighlightPlayer
  size?: number
  ring?: string
  ringOuter?: string
}) {
  const uri = player.pic ? config.profileUrl + player.pic : null
  const outer = ring ? size + 10 : size
  return (
    <View
      style={{
        width: outer,
        height: outer,
        borderRadius: outer / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ringOuter || 'transparent',
      }}>
      <View
        style={{
          width: ring ? size + 4 : size,
          height: ring ? size + 4 : size,
          borderRadius: (ring ? size + 4 : size) / 2,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: ring ? 2 : 0,
          borderColor: ring || 'transparent',
          overflow: 'hidden',
          backgroundColor: 'rgba(255,255,255,0.2)',
        }}>
        {uri ? (
          <Image
            source={{uri}}
            style={{width: size, height: size, borderRadius: size / 2}}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.18)',
            }}>
            <Text
              style={{
                fontWeight: '800',
                fontSize: size * 0.38,
                color: '#FFFFFF',
              }}>
              {(player.nickname || '?').slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
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
  theme,
}: {
  spotlight: WeeklySpotlight
  label: string
  theme: ReturnType<typeof getTheme>
}) {
  const icon = SPOTLIGHT_ICON[spotlight.id] || 'star-four-points'
  return (
    <Pressable
      onPress={() => openPlayer(spotlight.player.playerId)}
      style={({pressed}) => [
        styles.spotlight,
        {
          backgroundColor: theme.spotlightBg,
          borderColor: theme.spotlightBorder,
          opacity: pressed ? 0.88 : 1,
          transform: [{scale: pressed ? 0.98 : 1}],
        },
      ]}>
      <View style={styles.spotlightTop}>
        <MaterialCommunityIcons name={icon} size={14} color={theme.pillText} />
        <Text
          style={{fontSize: 11, color: theme.muted, fontWeight: '700', flex: 1}}
          numberOfLines={1}>
          {label}
        </Text>
      </View>
      <View style={styles.spotlightBody}>
        <Avatar player={spotlight.player} size={34} />
        <View style={{flex: 1}}>
          <Text
            style={{fontWeight: '800', color: theme.title, fontSize: 13}}
            numberOfLines={1}>
            {spotlight.player.nickname}
          </Text>
          <Text style={{fontSize: 11, color: theme.muted}} numberOfLines={1}>
            {spotlight.detail}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

export default function WeeklyHighlightsCard() {
  const {t} = useTranslation()
  const {getWeeklyHighlights} = useWeeklyHighlights()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const theme = getTheme(isDark)
  const [gameType, setGameType] = React.useState('all')
  const [data, setData] = React.useState<WeeklyHighlights | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [collapsed, setCollapsed] = React.useState(false)
  const [collapseReady, setCollapseReady] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    loadHomeHighlightsCollapsed().then(value => {
      if (!cancelled) {
        setCollapsed(value)
        setCollapseReady(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await getWeeklyHighlights({gameType})
        if (!cancelled) setData(res)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [getWeeklyHighlights, gameType])

  async function setCollapsedPersisted(next: boolean) {
    setCollapsed(next)
    try {
      await saveHomeHighlightsCollapsed(next)
    } catch {
      // ignore persistence failures
    }
  }

  if (!collapseReady) return null
  if (loading && !data?.playerOfTheWeek) return null
  if (!data?.playerOfTheWeek) return null

  const potw = data.playerOfTheWeek
  const options =
    (data.gameTypes?.length ?? 0) > 0
      ? data.gameTypes
      : [{code: 'all', label: 'All'}]
  const activeGameType = data.gameType || gameType
  const record = `${potw.won}–${potw.lost}${
    potw.played > 0 ? ` · ${potw.winPct}%` : ''
  }`

  if (collapsed) {
    return (
      <View style={styles.wrap}>
        <LinearGradient
          colors={[...theme.gradient]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[styles.card, styles.cardCollapsed, {borderColor: theme.border}]}>
          <Pressable
            onPress={() => openPlayer(potw.playerId)}
            style={styles.collapsedLeft}
            hitSlop={4}>
            <View style={[styles.badge, {backgroundColor: theme.accentSoft}]}>
              <Ionicons name="trophy" size={14} color={theme.pillText} />
            </View>
            <View style={{flex: 1, minWidth: 0}}>
              <Text style={[styles.kicker, {color: theme.accent}]} numberOfLines={1}>
                {t('player_of_the_week')}
              </Text>
              <Text
                style={[styles.collapsedName, {color: theme.title}]}
                numberOfLines={1}>
                {potw.nickname}
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => void setCollapsedPersisted(false)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('expand')}
            style={({pressed}) => [
              styles.moreBtn,
              {
                backgroundColor: theme.moreBg,
                borderColor: theme.moreBorder,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <Text style={{fontSize: 12, fontWeight: '800', color: theme.title}}>
              {t('expand')}
            </Text>
            <Ionicons name="chevron-down" size={14} color={theme.title} />
          </Pressable>
        </LinearGradient>
      </View>
    )
  }

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[...theme.gradient]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[styles.card, {borderColor: theme.border}]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View
              style={[styles.badge, {backgroundColor: theme.accentSoft}]}>
              <Ionicons name="trophy" size={14} color={theme.pillText} />
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.kicker, {color: theme.accent}]}>
                {t('player_of_the_week')}
              </Text>
              <Text style={{fontSize: 12, color: theme.muted, marginTop: 1}}>
                {formatWeekRange(
                  data.weekStart || data.matchDate,
                  data.weekEnd || data.matchDate,
                )}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => void setCollapsedPersisted(true)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('hide')}
              style={({pressed}) => [
                styles.moreBtn,
                {
                  backgroundColor: theme.moreBg,
                  borderColor: theme.moreBorder,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Text style={{fontSize: 12, fontWeight: '800', color: theme.title}}>
                {t('hide')}
              </Text>
              <Ionicons name="chevron-up" size={14} color={theme.title} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/statistics/highlights' as any)}
              hitSlop={8}
              style={({pressed}) => [
                styles.moreBtn,
                {
                  backgroundColor: theme.moreBg,
                  borderColor: theme.moreBorder,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Text style={{fontSize: 12, fontWeight: '800', color: theme.title}}>
                {t('more')}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={theme.title} />
            </Pressable>
          </View>
        </View>

        {options.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{marginBottom: 12}}
            contentContainerStyle={{paddingRight: 4}}>
            {options.map(opt => {
              const active = activeGameType === opt.code
              return (
                <Pressable
                  key={opt.code}
                  onPress={() => setGameType(opt.code)}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? theme.chipActiveBg : theme.chipBorder,
                      backgroundColor: active
                        ? theme.chipActiveBg
                        : theme.chipBg,
                    },
                  ]}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: active ? theme.chipActiveText : theme.muted,
                    }}>
                    {gameTypeLabel(opt, t)}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
        ) : null}

        <Pressable
          onPress={() => openPlayer(potw.playerId)}
          style={({pressed}) => [
            styles.hero,
            {
              backgroundColor: theme.heroBg,
              borderColor: theme.heroBorder,
              opacity: loading ? 0.7 : pressed ? 0.92 : 1,
            },
          ]}>
          <Avatar
            player={potw}
            size={64}
            ring={theme.ring}
            ringOuter={theme.ringOuter}
          />
          <View style={{flex: 1, minWidth: 0}}>
            <Text style={[styles.heroName, {color: theme.title}]} numberOfLines={1}>
              {potw.nickname}
            </Text>
            {potw.team ? (
              <Text style={{color: theme.muted, marginTop: 2}} numberOfLines={1}>
                {potw.team.shortName || potw.team.name}
              </Text>
            ) : null}
            <View
              style={[
                styles.recordPill,
                {backgroundColor: theme.pillBg, marginTop: 8},
              ]}>
              <Text style={{color: theme.pillText, fontWeight: '800', fontSize: 12}}>
                {record}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.muted} />
        </Pressable>

        {data.spotlights.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{marginTop: 12}}
            contentContainerStyle={{paddingRight: 4}}>
            {data.spotlights.map(s => (
              <SpotlightRow
                key={s.id}
                spotlight={s}
                label={t(SPOTLIGHT_I18N[s.id] || s.label)}
                theme={theme}
              />
            ))}
          </ScrollView>
        ) : null}
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    overflow: 'hidden',
  },
  cardCollapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 10,
  },
  collapsedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    minWidth: 0,
  },
  collapsedName: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    minWidth: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chip: {
    marginRight: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  heroName: {
    fontSize: 20,
    fontWeight: '800',
  },
  recordPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  spotlight: {
    width: 168,
    marginRight: 8,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  spotlightTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  spotlightBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
})
