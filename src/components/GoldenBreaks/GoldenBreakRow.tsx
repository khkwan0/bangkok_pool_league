import config from '@/config'
import {
  goldenBreakEmphasis,
  type GoldenBreakEmphasis,
  type GoldenBreakItem,
  type GoldenBreakPlayer,
} from '@/lib/goldenBreaks'
import {MaterialCommunityIcons} from '@expo/vector-icons'
import {LinearGradient} from 'expo-linear-gradient'
import {useRouter} from 'expo-router'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native'

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return dateStr
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function openPlayer(router: ReturnType<typeof useRouter>, playerId: number) {
  router.push({
    pathname: '/Player' as any,
    params: {playerId: String(playerId)},
  })
}

function openMatch(router: ReturnType<typeof useRouter>, matchId: number) {
  router.push({
    pathname: '/completed/Match' as any,
    params: {params: JSON.stringify({matchId})},
  })
}

function Avatar({
  player,
  size,
}: {
  player: GoldenBreakPlayer
  size: number
}) {
  const uri = player.pic ? config.profileUrl + player.pic : null
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: 'rgba(120, 72, 0, 0.18)',
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
        <Text style={{fontWeight: '800', fontSize: size * 0.38, color: '#3B2A00'}}>
          {(player.nickname || '?').slice(0, 1).toUpperCase()}
        </Text>
      )}
    </View>
  )
}

export function GoldenBreakRow({
  item,
  emphasis,
  unread = false,
}: {
  item: GoldenBreakItem
  emphasis: GoldenBreakEmphasis
  unread?: boolean
}) {
  const router = useRouter()
  const {t} = useTranslation()
  const isDark = useColorScheme() === 'dark'
  const hero = emphasis === 'hero'
  const featured = emphasis === 'featured'
  const avatarSize = hero ? 64 : featured ? 44 : 32
  const players =
    item.players.length > 0
      ? item.players
      : [{playerId: 0, nickname: item.winnerTeamName, pic: null}]
  const meta = [
    formatDate(item.matchDate),
    `${item.winnerTeamName} ${t('golden_breaks_vs', {opponent: item.opponentTeamName})}`,
    `${item.homeFrames}–${item.awayFrames}`,
    t('golden_breaks_frame', {n: item.frameNumber}),
  ].join(' · ')

  const ink = hero ? '#3B2A00' : isDark ? '#F8FAFC' : '#1C1917'
  const muted = hero ? 'rgba(59,42,0,0.75)' : isDark ? 'rgba(226,232,240,0.7)' : '#57534E'
  const label = hero ? '#7A4E00' : '#B45309'

  const body = (
    <View style={{gap: 10}}>
      <View style={styles.topRow}>
        <View style={styles.labelRow}>
          <MaterialCommunityIcons
            name="star"
            size={hero ? 16 : 13}
            color={label}
          />
          <Text style={[styles.kicker, {color: label}]}>
            {hero ? t('golden_breaks_latest') : t('golden_break_action')}
          </Text>
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
          ) : null}
        </View>
        {item.divisionName ? (
          <Text style={[styles.division, {color: muted}]} numberOfLines={1}>
            {item.divisionName}
          </Text>
        ) : null}
      </View>
      <View style={styles.players}>
        {players.map(player => (
          <Pressable
            key={player.playerId || player.nickname}
            disabled={player.playerId <= 0}
            onPress={() => openPlayer(router, player.playerId)}
            style={styles.player}>
            <Avatar player={player} size={avatarSize} />
            <Text
              style={[
                styles.name,
                {
                  color: ink,
                  fontSize: hero ? 22 : featured ? 17 : 15,
                },
              ]}
              numberOfLines={1}>
              {player.nickname}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => openMatch(router, item.matchId)}>
        <Text style={[styles.meta, {color: muted}]} numberOfLines={2}>
          {meta}
        </Text>
      </Pressable>
    </View>
  )

  if (hero) {
    return (
      <LinearGradient
        colors={['#F8D56A', '#E8A317']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.hero}>
        {body}
      </LinearGradient>
    )
  }

  const backgroundColor = featured
    ? isDark
      ? '#3A2A10'
      : '#FFF6D8'
    : emphasis === 'recent'
      ? isDark
        ? '#241C12'
        : '#FFFFFF'
      : isDark
        ? '#1A1A1A'
        : '#F7F7F7'
  const borderColor = featured || emphasis === 'recent' ? '#E8A317' : isDark ? '#333' : '#E7E5E4'

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
          borderLeftWidth: emphasis === 'earlier' ? 1 : 4,
          opacity: emphasis === 'earlier' ? 0.85 : 1,
        },
      ]}>
      {body}
    </View>
  )
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 18,
    padding: 16,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  division: {
    flexShrink: 1,
    fontSize: 12,
  },
  players: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: '100%',
  },
  name: {
    fontWeight: '800',
    flexShrink: 1,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
})

export function goldenBreakRank(index: number, offset = 0) {
  return goldenBreakEmphasis(offset + index)
}
