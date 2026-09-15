import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {
  NON_CANONICAL_ACCENT,
  NON_CANONICAL_ACCENT_SOFT,
  NON_CANONICAL_ACCENT_SOFT_DARK,
} from '@/types/competition'
import {formatBangkokWeekdayDate} from '@/lib/bangkokTime'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import React from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useColorScheme,
} from 'react-native'

export type MiniMatchCardItem = {
  id: number
  date: string
  status_id: number
  home_team_name?: string
  away_team_name?: string
  home_frames?: number | null
  away_frames?: number | null
  round?: number | null
  tournament_id?: number | null
}

type Props = {
  item: MiniMatchCardItem
  onPress: () => void
  opening?: boolean
}

function teamLabel(name: string | undefined, fallback: string) {
  const trimmed = (name || '').trim()
  return trimmed || fallback
}

export function MiniMatchCard({item, onPress, opening}: Props) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const soft = isDark
    ? NON_CANONICAL_ACCENT_SOFT_DARK
    : NON_CANONICAL_ACCENT_SOFT
  const cardBg = isDark ? '#242424' : '#FFFFFF'
  const muted = isDark ? '#A8A29E' : '#64748B'
  const home = teamLabel(item.home_team_name, 'Home')
  const away = teamLabel(item.away_team_name, 'Away')
  const dateLabel = formatBangkokWeekdayDate(item.date)
  const hasScore =
    item.home_frames != null ||
    item.away_frames != null ||
    Number(item.status_id) === 3
  const radius = 22

  return (
    // Outer wrapper keeps the shadow; matching bg + radius so corners round cleanly.
    <View
      style={[
        styles.shadowWrap,
        {
          borderRadius: radius,
          backgroundColor: cardBg,
          shadowColor: isDark ? '#000' : '#0F172A',
          shadowOpacity: isDark ? 0.45 : 0.14,
          shadowRadius: 12,
          shadowOffset: {width: 0, height: 6},
          elevation: 6,
        },
      ]}>
      <Pressable
        onPress={onPress}
        disabled={opening}
        accessibilityRole="button"
        accessibilityLabel={`${home} versus ${away}, ${dateLabel}`}
        style={({pressed}) => [
          styles.card,
          {
            borderRadius: radius,
            backgroundColor: cardBg,
            borderColor: isDark ? '#3F3F46' : '#E2E8F0',
            opacity: opening ? 0.75 : 1,
            transform: [{scale: pressed && !opening ? 0.985 : 1}],
          },
        ]}>
        <View style={[styles.accentBar, {borderTopLeftRadius: radius, borderTopRightRadius: radius}]} />

        <View style={styles.body}>
          <View style={styles.metaRow}>
            <View style={[styles.dateChip, {backgroundColor: soft}]}>
              <MCI name="calendar" size={14} color={NON_CANONICAL_ACCENT} />
              <Text
                numberOfLines={1}
                style={styles.dateText}>
                {dateLabel}
              </Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              {Number(item.tournament_id) > 0 ? (
                <Text
                  style={{
                    color: NON_CANONICAL_ACCENT,
                    fontWeight: '700',
                    fontSize: 11,
                    textTransform: 'uppercase',
                  }}>
                  Tournament
                </Text>
              ) : null}
              <Text style={[styles.matchId, {color: muted}]}>#{item.id}</Text>
            </View>
          </View>

          <View style={styles.teamsRow}>
            <View style={styles.teamCol}>
              <Text numberOfLines={2} style={styles.teamName}>
                {home}
              </Text>
              {hasScore ? (
                <Text style={styles.score}>{Number(item.home_frames) || 0}</Text>
              ) : null}
            </View>

            <View style={styles.vsCol}>
              <View style={[styles.vsBadge, {backgroundColor: soft}]}>
                <Text style={styles.vsText}>VS</Text>
              </View>
            </View>

            <View style={styles.teamCol}>
              <Text numberOfLines={2} style={styles.teamName}>
                {away}
              </Text>
              {hasScore ? (
                <Text style={styles.score}>{Number(item.away_frames) || 0}</Text>
              ) : null}
            </View>
          </View>

          <View
            style={[
              styles.footer,
              {borderTopColor: isDark ? '#333' : '#F1F5F9'},
            ]}>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={[styles.statusText, {color: muted}]}>
                {Number(item.status_id) === 1 ? 'Open' : 'Match'}
                {item.round != null ? ` · Round ${item.round}` : ''}
              </Text>
            </View>
            {opening ? (
              <View style={styles.statusRow}>
                <ActivityIndicator size="small" color={NON_CANONICAL_ACCENT} />
                <Text style={styles.ctaText}>Opening…</Text>
              </View>
            ) : (
              <View style={styles.statusRow}>
                <Text style={styles.ctaText}>Scoresheet</Text>
                <MCI
                  name="chevron-right"
                  size={18}
                  color={NON_CANONICAL_ACCENT}
                />
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  shadowWrap: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  accentBar: {
    height: 5,
    backgroundColor: NON_CANONICAL_ACCENT,
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: '75%',
  },
  dateText: {
    color: NON_CANONICAL_ACCENT,
    fontSize: 12,
    fontWeight: '700',
  },
  matchId: {
    fontSize: 12,
    fontWeight: '600',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  teamName: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  score: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '800',
    color: NON_CANONICAL_ACCENT,
  },
  vsCol: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    color: NON_CANONICAL_ACCENT,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ctaText: {
    color: NON_CANONICAL_ACCENT,
    fontSize: 12,
    fontWeight: '700',
  },
})
