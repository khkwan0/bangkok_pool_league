import {formatCupBannerLabel} from '@/components/upcoming/CupMatchBanner'
import {useLeagueContext} from '@/context/LeagueContext'
import {BANGKOK_ZONE, nowInBangkok, toBangkok} from '@/lib/bangkokTime'
import {
  getMatchDisplayDate,
  isPostponedDateLabel,
} from '@/lib/postponedProposal'
import {Ionicons, MaterialIcons} from '@expo/vector-icons'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import {LinearGradient} from 'expo-linear-gradient'
import {DateTime} from 'luxon'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  useColorScheme,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

const ACCENT = '#37003C'
const CARD_ACCENTS = [
  '#3B82F6',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#F43F5E',
  '#8B5CF6',
] as const
const CUP_ACCENT = '#F59E0B'

export type CalendarFixture = {
  date?: string
  original_date?: string
  ad_spot?: boolean
  key?: string
  home_team_id?: number
  away_team_id?: number
  home_team_short_name?: string
  away_team_short_name?: string
  division_name?: string
  name?: string
  location?: string
  tournament_id?: number | string
  round?: number | null
  stage_label?: string | null
  stage_key?: string | null
  home_logo?: string | null
  away_logo?: string | null
  home_confirmed?: number | string
  away_confirmed?: number | string
  homeStats?: {rank?: number; won?: number; lost?: number; tied?: number}
  awayStats?: {rank?: number; won?: number; lost?: number; tied?: number}
}

type IndexedMatch = {index: number; match: CalendarFixture}

type Props = {
  fixtures: CalendarFixture[]
  onOpenMatch: (index: number) => void
  refreshing: boolean
  onRefresh: () => void
  onScrollBeginDrag?: () => void
  contentContainerStyle?: StyleProp<ViewStyle>
}

function matchDayKey(match: CalendarFixture): string | null {
  if (match.ad_spot) return null
  const raw = getMatchDisplayDate({
    date: match.date ?? '',
    original_date: match.original_date,
  })
  if (!raw || isPostponedDateLabel(raw)) return null
  const iso = toBangkok(raw)
  if (iso.isValid) return iso.toFormat('yyyy-MM-dd')
  const sql = DateTime.fromSQL(raw, {zone: BANGKOK_ZONE})
  if (sql.isValid) return sql.toFormat('yyyy-MM-dd')
  return null
}

function matchTimeLabel(match: CalendarFixture): string | null {
  const raw = getMatchDisplayDate({
    date: match.date ?? '',
    original_date: match.original_date,
  })
  if (!raw || isPostponedDateLabel(raw)) return null
  const dt = toBangkok(raw)
  if (!dt.isValid || (dt.hour === 0 && dt.minute === 0 && dt.second === 0)) {
    return null
  }
  return dt.toFormat('h:mm a')
}

function groupFixtures(fixtures: CalendarFixture[]) {
  const byDay = new Map<string, IndexedMatch[]>()
  const unscheduled: IndexedMatch[] = []
  fixtures.forEach((match, index) => {
    if (match?.ad_spot) return
    const key = matchDayKey(match)
    if (!key) {
      unscheduled.push({index, match})
      return
    }
    const bucket = byDay.get(key) ?? []
    bucket.push({index, match})
    byDay.set(key, bucket)
  })
  for (const bucket of byDay.values()) {
    bucket.sort((a, b) => {
      const aTime = toBangkok(
        getMatchDisplayDate({
          date: a.match.date ?? '',
          original_date: a.match.original_date,
        }),
      )
      const bTime = toBangkok(
        getMatchDisplayDate({
          date: b.match.date ?? '',
          original_date: b.match.original_date,
        }),
      )
      if (!aTime.isValid || !bTime.isValid) return 0
      return aTime.toMillis() - bTime.toMillis()
    })
  }
  return {byDay, unscheduled}
}

function initialFocus(fixtures: CalendarFixture[]) {
  const {byDay} = groupFixtures(fixtures)
  const today = nowInBangkok()
  const todayKey = today.toFormat('yyyy-MM-dd')
  const keys = [...byDay.keys()].sort()
  const pick = keys.find(key => key >= todayKey) ?? todayKey
  const month = DateTime.fromISO(pick, {zone: BANGKOK_ZONE})
  return {
    selectedKey: pick,
    visibleMonth: (month.isValid ? month : today).startOf('month'),
  }
}

function monthGrid(month: DateTime): DateTime[] {
  const start = month.startOf('month')
  const gridStart = start.minus({days: start.weekday % 7})
  const days = Array.from({length: 42}, (_, i) => gridStart.plus({days: i}))
  while (
    days.length > 35 &&
    days.slice(-7).every(day => !day.hasSame(month, 'month'))
  ) {
    days.splice(-7, 7)
  }
  return days
}

function isCup(match: CalendarFixture): boolean {
  return Number(match.tournament_id) > 0
}

export default function MatchesCalendar({
  fixtures,
  onOpenMatch,
  refreshing,
  onRefresh,
  onScrollBeginDrag,
  contentContainerStyle,
}: Props) {
  const {t, i18n} = useTranslation()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const locale = i18n.language?.startsWith('th') ? 'th' : 'en'
  const screenBg = isDark ? '#1A1A1A' : '#F5F5F5'
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF'
  const textColor = isDark ? '#F8FAFC' : '#111827'
  const mutedColor = isDark ? '#94A3B8' : '#64748B'
  const gridBorder = isDark ? '#2A2A2A' : '#E5E7EB'

  const {byDay, unscheduled} = React.useMemo(
    () => groupFixtures(fixtures),
    [fixtures],
  )
  const [selectedKey, setSelectedKey] = React.useState(
    () => initialFocus(fixtures).selectedKey,
  )
  const [visibleMonth, setVisibleMonth] = React.useState(
    () => initialFocus(fixtures).visibleMonth,
  )
  const [gridWidth, setGridWidth] = React.useState(0)
  const cellSize = gridWidth > 0 ? Math.floor(gridWidth / 7) : 0

  const days = React.useMemo(
    () => monthGrid(visibleMonth),
    [visibleMonth],
  )
  const weekdayLabels = React.useMemo(() => {
    const sunday = DateTime.fromObject(
      {year: 2024, month: 1, day: 7},
      {zone: BANGKOK_ZONE},
    ).setLocale(locale)
    return Array.from({length: 7}, (_, i) =>
      sunday.plus({days: i}).toFormat('ccc'),
    )
  }, [locale])

  const selectedMatches = byDay.get(selectedKey) ?? []
  const selectedLabel = React.useMemo(() => {
    const dt = DateTime.fromISO(selectedKey, {zone: BANGKOK_ZONE}).setLocale(
      locale,
    )
    return dt.isValid ? dt.toLocaleString(DateTime.DATE_HUGE) : selectedKey
  }, [locale, selectedKey])

  const monthCount = React.useMemo(() => {
    const prefix = visibleMonth.toFormat('yyyy-MM')
    let count = 0
    for (const [key, items] of byDay) {
      if (key.startsWith(prefix)) count += items.length
    }
    return count
  }, [byDay, visibleMonth])

  function selectDay(day: DateTime) {
    setSelectedKey(day.toFormat('yyyy-MM-dd'))
    if (!day.hasSame(visibleMonth, 'month')) {
      setVisibleMonth(day.startOf('month'))
    }
  }

  function goToToday() {
    const now = nowInBangkok()
    setVisibleMonth(now.startOf('month'))
    setSelectedKey(now.toFormat('yyyy-MM-dd'))
  }

  const todayKey = nowInBangkok().toFormat('yyyy-MM-dd')

  return (
    <ScrollView
      style={{flex: 1, backgroundColor: screenBg}}
      contentContainerStyle={[contentContainerStyle, {paddingHorizontal: 16}]}
      showsVerticalScrollIndicator={false}
      onScrollBeginDrag={onScrollBeginDrag}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
          gap: 8,
        }}>
        <View style={{flex: 1}}>
          <Text
            className="text-xl font-bold"
            style={{color: textColor}}>
            {visibleMonth.setLocale(locale).toFormat('LLLL yyyy')}
          </Text>
          <Text style={{color: mutedColor, marginTop: 2}}>
            {monthCount}{' '}
            {monthCount === 1 ? t('match') : t('matches')}
          </Text>
        </View>
        <NavButton
          icon="chevron-left"
          label={t('previous_month')}
          isDark={isDark}
          onPress={() => setVisibleMonth(month => month.minus({months: 1}))}
        />
        <Pressable
          accessibilityRole="button"
          onPress={goToToday}
          style={({pressed}) => ({
            backgroundColor: pressed ? '#2A002E' : ACCENT,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
          })}>
          <Text className="font-semibold" style={{color: '#FFFFFF'}}>
            {t('today')}
          </Text>
        </Pressable>
        <NavButton
          icon="chevron-right"
          label={t('next_month')}
          isDark={isDark}
          onPress={() => setVisibleMonth(month => month.plus({months: 1}))}
        />
      </View>

      <View
        onLayout={event => {
          const next = Math.floor(event.nativeEvent.layout.width)
          setGridWidth(current => (current === next ? current : next))
        }}
        style={{
          backgroundColor: cardBg,
          borderRadius: 12,
          overflow: 'hidden',
          borderWidth: isDark ? 0 : 1,
          borderColor: gridBorder,
        }}>
        <View style={{flexDirection: 'row'}}>
          {weekdayLabels.map(label => (
            <View
              key={label}
              style={{
                width: cellSize || undefined,
                flex: cellSize ? undefined : 1,
                paddingVertical: 8,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: '600',
                  color: mutedColor,
                }}>
                {label}
              </Text>
            </View>
          ))}
        </View>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          {days.map(day => {
            const key = day.toFormat('yyyy-MM-dd')
            const items = byDay.get(key) ?? []
            const inMonth = day.hasSame(visibleMonth, 'month')
            const selected = key === selectedKey
            const isToday = key === todayKey
            const hasCup = items.some(item => isCup(item.match))
            const count = items.length
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityState={{selected}}
                accessibilityLabel={`${day.setLocale(locale).toLocaleString(DateTime.DATE_MED)}, ${count} ${count === 1 ? t('match') : t('matches')}`}
                onPress={() => selectDay(day)}
                style={{
                  width: cellSize || `${100 / 7}%`,
                  height: cellSize || 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTopWidth: 1,
                  borderTopColor: gridBorder,
                  backgroundColor: selected
                    ? ACCENT
                    : count > 0
                      ? isDark
                        ? '#2A1230'
                        : '#F6EEF7'
                      : 'transparent',
                  opacity: inMonth ? 1 : 0.38,
                }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: isToday || selected ? '700' : '500',
                    color: selected
                      ? '#FFFFFF'
                      : isToday
                        ? isDark
                          ? '#F0ABFC'
                          : ACCENT
                        : textColor,
                  }}>
                  {day.day}
                </Text>
                {count > 0 ? (
                  <View
                    style={{
                      marginTop: 2,
                      minWidth: 18,
                      paddingHorizontal: 4,
                      borderRadius: 999,
                      backgroundColor: selected
                        ? 'rgba(255,255,255,0.22)'
                        : ACCENT,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: '#FFFFFF',
                      }}>
                      {count > 9 ? '9+' : String(count)}
                    </Text>
                  </View>
                ) : (
                  <View style={{height: 14, marginTop: 2}} />
                )}
                {hasCup ? (
                  <View
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#F59E0B',
                    }}
                  />
                ) : null}
              </Pressable>
            )
          })}
        </View>
      </View>

      <Text
        className="font-bold"
        style={{color: textColor, marginTop: 18, marginBottom: 8}}>
        {selectedLabel}
      </Text>
      {selectedMatches.length === 0 ? (
        <Text style={{color: mutedColor, marginBottom: 12}}>
          {t('no_matches_on_day')}
        </Text>
      ) : (
        selectedMatches.map(item => (
          <CalendarMatchCard
            key={`${item.index}-${item.match.home_team_id}-${item.match.away_team_id}`}
            item={item}
            onPress={() => onOpenMatch(item.index)}
          />
        ))
      )}

      {unscheduled.length > 0 ? (
        <View style={{marginTop: 8}}>
          <Text
            className="font-bold"
            style={{color: textColor, marginBottom: 8}}>
            {t('unscheduled_matches')}
          </Text>
          {unscheduled.map(item => (
            <CalendarMatchCard
              key={`unscheduled-${item.index}`}
              item={item}
              onPress={() => onOpenMatch(item.index)}
            />
          ))}
        </View>
      ) : null}
    </ScrollView>
  )
}

function NavButton({
  icon,
  label,
  isDark,
  onPress,
}: {
  icon: 'chevron-left' | 'chevron-right'
  label: string
  isDark: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({pressed}) => ({
        backgroundColor: isDark
          ? pressed
            ? '#2A2A2A'
            : '#1E1E1E'
          : pressed
            ? '#E5E7EB'
            : '#FFFFFF',
        borderRadius: 8,
        padding: 8,
        borderWidth: isDark ? 0 : 1,
        borderColor: '#E5E7EB',
      })}>
      <MaterialIcons
        name={icon}
        size={22}
        color={isDark ? '#FFFFFF' : ACCENT}
      />
    </Pressable>
  )
}

function hasLogoUri(uri?: string | null) {
  if (typeof uri !== 'string') return false
  const trimmed = uri.trim()
  if (!trimmed) return false
  if (/\/logos\/?$/i.test(trimmed)) return false
  if (/\/(null|undefined)(\?|$)/i.test(trimmed)) return false
  return true
}

function recordLabel(stats?: {
  won?: number
  lost?: number
  tied?: number
}): string | null {
  if (!stats) return null
  if (stats.won == null && stats.lost == null && stats.tied == null) return null
  return `${stats.won ?? 0}-${stats.lost ?? 0}-${stats.tied ?? 0}`
}

function CalendarMatchCard({
  item,
  onPress,
}: {
  item: IndexedMatch
  onPress: () => void
}) {
  const {t} = useTranslation()
  const {state} = useLeagueContext()
  const match = item.match
  const cup = isCup(match)
  const accent = cup ? CUP_ACCENT : CARD_ACCENTS[item.index % CARD_ACCENTS.length]
  const home = match.home_team_short_name || '—'
  const away = match.away_team_short_name || '—'
  const time = matchTimeLabel(match)
  const venue = typeof match.name === 'string' ? match.name.trim() : ''
  const address = typeof match.location === 'string' ? match.location.trim() : ''
  const division =
    typeof match.division_name === 'string' ? match.division_name.trim() : ''
  const bothConfirmed =
    Number(match.home_confirmed) > 0 && Number(match.away_confirmed) > 0
  const sportIcon = state.sport === 'darts' ? 'dart' : 'billiards-rack'
  const cupLabel = cup
    ? formatCupBannerLabel({
        round: match.round,
        stage_label: match.stage_label,
        stage_key: match.stage_key,
        division_name: match.division_name,
        fallback: t('cup_match', {defaultValue: 'Cup'}),
      })
    : ''

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${home} vs ${away}`}
      onPress={onPress}
      style={({pressed}) => ({
        marginBottom: 14,
        borderRadius: 20,
        opacity: pressed ? 0.94 : 1,
        transform: [{scale: pressed ? 0.985 : 1}],
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.28,
        shadowRadius: 14,
        elevation: 6,
      })}>
      <View
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: cup ? 1.5 : 0,
          borderColor: 'rgba(245,158,11,0.75)',
        }}>
      <LinearGradient
        colors={
          cup
            ? ['#1A1205', '#1C1408', '#0F172A']
            : ['#0B1220', '#111827', '#0F172A']
        }
        start={{x: 0.1, y: 0}}
        end={{x: 0.9, y: 1}}>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -36,
            right: -24,
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: accent,
            opacity: 0.2,
          }}
        />
        {cup ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: CUP_ACCENT,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}>
            <MCI name="trophy" size={16} color="#FFFBEB" />
            <Text
              style={{flex: 1, color: '#FFFBEB', fontWeight: '800'}}
              numberOfLines={1}>
              {cupLabel}
            </Text>
          </View>
        ) : (
          <View style={{height: 4, backgroundColor: accent}} />
        )}

        <View style={{paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14}}>
          {(!cup && division) || time || bothConfirmed ? (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 12,
              }}>
              {!cup && division ? (
                <CardChip icon="shield-outline" label={division} color={accent} />
              ) : null}
              {time ? (
                <CardChip icon="clock-outline" label={time} color="#E2E8F0" />
              ) : null}
              {bothConfirmed ? (
                <CardChip
                  icon="check-decagram"
                  label={t('match_confirmed')}
                  color="#34D399"
                />
              ) : null}
            </View>
          ) : null}

          <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
            <TeamSide
              name={home}
              logo={match.home_logo}
              accent={accent}
              rank={match.homeStats?.rank}
              record={recordLabel(match.homeStats)}
            />
            <View style={{width: 52, alignItems: 'center', paddingTop: 10}}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${accent}22`,
                  borderWidth: 1,
                  borderColor: `${accent}66`,
                }}>
                <MCI name={sportIcon} size={22} color={accent} />
              </View>
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: '800',
                  letterSpacing: 1.4,
                  color: 'rgba(226,232,240,0.55)',
                }}>
                VS
              </Text>
            </View>
            <TeamSide
              name={away}
              logo={match.away_logo}
              accent={accent}
              rank={match.awayStats?.rank}
              record={recordLabel(match.awayStats)}
            />
          </View>

          {venue || address ? (
            <View
              style={{
                marginTop: 14,
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderColor: 'rgba(148,163,184,0.16)',
                paddingHorizontal: 10,
                paddingVertical: 9,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
              <Ionicons name="location-outline" size={16} color={accent} />
              <View style={{flex: 1}}>
                {venue ? (
                  <Text
                    style={{color: '#F8FAFC', fontWeight: '700', fontSize: 14}}
                    numberOfLines={1}>
                    {venue}
                  </Text>
                ) : null}
                {address ? (
                  <Text
                    style={{
                      color: 'rgba(226,232,240,0.68)',
                      fontSize: 12,
                      marginTop: venue ? 2 : 0,
                    }}
                    numberOfLines={1}>
                    {address}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>
      </LinearGradient>
      </View>
    </Pressable>
  )
}

function CardChip({
  icon,
  label,
  color,
}: {
  icon: React.ComponentProps<typeof MCI>['name']
  label: string
  color: string
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: `${color}22`,
      }}>
      <MCI name={icon} size={13} color={color} />
      <Text style={{color, fontSize: 11, fontWeight: '700'}} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

function TeamSide({
  name,
  logo,
  accent,
  rank,
  record,
}: {
  name: string
  logo?: string | null
  accent: string
  rank?: number
  record: string | null
}) {
  return (
    <View style={{flex: 1, alignItems: 'center'}}>
      <TeamMark uri={logo} name={name} accent={accent} />
      {rank != null ? (
        <Text style={{color: accent, fontSize: 12, fontWeight: '800', marginTop: 6}}>
          #{rank}
        </Text>
      ) : null}
      <Text
        style={{
          color: '#F8FAFC',
          fontWeight: '800',
          fontSize: 16,
          textAlign: 'center',
          marginTop: rank != null ? 2 : 8,
        }}
        numberOfLines={2}>
        {name}
      </Text>
      {record ? (
        <Text
          style={{
            marginTop: 4,
            color: 'rgba(226,232,240,0.7)',
            fontSize: 12,
            fontWeight: '600',
          }}>
          {record}
        </Text>
      ) : null}
    </View>
  )
}

function TeamMark({
  uri,
  name,
  accent,
}: {
  uri?: string | null
  name: string
  accent: string
}) {
  const [failed, setFailed] = React.useState(false)
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const showImage = hasLogoUri(uri) && !failed

  return (
    <View
      style={{
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(148,163,184,0.22)',
      }}>
      {showImage ? (
        <Image
          source={{uri: uri!}}
          resizeMode="contain"
          style={{width: 48, height: 48}}
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={{color: accent, fontSize: 26, fontWeight: '800'}}>
          {initial}
        </Text>
      )}
    </View>
  )
}
