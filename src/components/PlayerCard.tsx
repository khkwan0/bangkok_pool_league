import {ThemedText as Text} from './ThemedText'
import {useMatchContext} from '@/context/MatchContext'
import {
  useColorScheme,
  Image,
  View,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native'
import {router} from 'expo-router'
import config from '@/config'
import {useTeams} from '@/hooks'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {MaterialCommunityIcons} from '@expo/vector-icons'
import {LinearGradient} from 'expo-linear-gradient'

const ACCENTS = [
  '#3B82F6',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#F43F5E',
  '#8B5CF6',
] as const

type PlayerCardPropsType = {
  frameIndex: number
  slot: number
  side: string
  player: any
  frameNumber: number
  frameType: string
  disabled: boolean
  disabledReason?: string | null
  abbrevFirst?: boolean
  abbrevLast?: boolean
  isExisting?: boolean
  mfpp: number
  accentIndex?: number
}

function StatPill({
  label,
  wins,
  played,
  accent,
  isDark,
}: {
  label: string
  wins: number
  played: number
  accent: string
  isDark: boolean
}) {
  if (played <= 0) return null
  const pct = ((wins / played) * 100).toFixed(0)
  return (
    <View
      style={[
        styles.statPill,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : `${accent}14`,
          borderColor: isDark ? 'rgba(148,163,184,0.18)' : `${accent}33`,
        },
      ]}>
      <Text style={[styles.statLabel, {color: accent}]}>{label}</Text>
      <Text type="defaultSemiBold" style={styles.statRecord}>
        {`${wins}-${played - wins}`}
      </Text>
      <Text style={styles.statPct}>{`${pct}%`}</Text>
    </View>
  )
}

export default function PlayerCard({
  frameIndex,
  slot,
  side,
  player,
  frameNumber,
  frameType,
  disabled,
  disabledReason,
  abbrevFirst = true,
  abbrevLast = true,
  isExisting = false,
  mfpp,
  accentIndex = 0,
}: PlayerCardPropsType) {
  const {UpdateFramePlayers}: any = useMatchContext()
  const [stats, setStats] = React.useState({
    played: 0,
    wins: 0,
    s_played: 0,
    s_wins: 0,
    d_played: 0,
    d_wins: 0,
  })
  const [isPressed, setIsPressed] = React.useState(false)
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const teams = useTeams()
  const {state}: any = useMatchContext()
  const {t} = useTranslation()
  const theme = useColorScheme()
  const isDark = theme === 'dark'

  const accent = ACCENTS[Math.abs(accentIndex) % ACCENTS.length]
  const playerId = player.id ?? player.playerId
  const nickname = player.name ?? player.nickname ?? ''
  const firstName = player.firstname ?? player.firstName ?? ''
  const lastName = player.lastname ?? player.lastName ?? ''
  const photo = player.profile_picture

  async function HandlePress() {
    try {
      let newPlayer = false
      if (isExisting) {
        await teams.AddExistingPlayerToTeam(
          side === 'home'
            ? state.matchInfo.home_team_id
            : state.matchInfo.away_team_id,
          playerId,
        )
        newPlayer = true
      }
      UpdateFramePlayers(
        frameIndex,
        side,
        slot,
        playerId,
        nickname,
        newPlayer,
        frameType,
        frameNumber,
        mfpp,
      )
      router.dismissTo('/Match')
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    if (typeof state.stats === 'undefined' || playerId == null) return

    const key = `p${playerId}`
    const playerStats = state.stats[key]
    if (typeof playerStats === 'undefined') {
      setStats({
        played: 0,
        wins: 0,
        s_played: 0,
        s_wins: 0,
        d_played: 0,
        d_wins: 0,
      })
      return
    }

    let wins = 0
    let s_wins = 0
    let d_wins = 0
    let played = 0
    let s_played = 0
    let d_played = 0

    Object.keys(playerStats).forEach(frameKey => {
      played++
      const entry = playerStats[frameKey]
      const noPlayers = Number(entry.noPlayers)
      const isSingles = noPlayers === 1
      const isDoubles = noPlayers === 2
      if (isSingles) s_played++
      else if (isDoubles) d_played++
      if (entry.win) {
        wins++
        if (isSingles) s_wins++
        else if (isDoubles) d_wins++
      }
    })

    setStats({wins, s_wins, d_wins, played, s_played, d_played})
  }, [state.stats, playerId])

  const abbreviate = (name: string, abbrev: boolean) => {
    if (!name) return ''
    if (!abbrev) return name
    return name.substr(0, name.length > 2 ? 3 : 2)
  }

  const displayName = [
    abbreviate(firstName, abbrevFirst),
    abbreviate(lastName, abbrevLast),
  ]
    .filter(Boolean)
    .join(' ')

  const gradientColors = isDark
    ? ([`${accent}28`, 'rgba(15,23,42,0.96)', 'rgba(15,23,42,0.99)'] as const)
    : ([`${accent}22`, '#FFFFFF', '#F8FAFC'] as const)

  return (
    <View
      style={[
        styles.wrap,
        {
          opacity: disabled ? 0.58 : 1,
          shadowColor: isDark ? '#000' : '#0F172A',
          shadowOpacity: isDark ? 0.35 : 0.12,
        },
      ]}>
      <LinearGradient
        colors={[...gradientColors]}
        locations={[0, 0.45, 1]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[
          styles.board,
          {
            borderColor: disabled
              ? isDark
                ? 'rgba(148,163,184,0.12)'
                : 'rgba(15,23,42,0.08)'
              : isDark
                ? `${accent}55`
                : `${accent}44`,
          },
        ]}>
        <View style={[styles.stripe, {backgroundColor: accent}]} />

        <View style={styles.content}>
          <View style={styles.row}>
            <Pressable
              onPress={() => photo && setIsModalVisible(true)}
              disabled={!photo}
              style={[
                styles.avatar,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : `${accent}18`,
                  borderColor: `${accent}55`,
                },
              ]}>
              {photo ? (
                <Image
                  source={{uri: config.profileUrl + photo}}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <MaterialCommunityIcons
                  name="account"
                  size={28}
                  color={accent}
                />
              )}
            </Pressable>

            <View style={styles.info}>
              <Text type="defaultSemiBold" numberOfLines={1}>
                {nickname}
              </Text>
              {!!displayName && (
                <Text style={styles.subName} numberOfLines={1}>
                  {displayName}
                </Text>
              )}
              <View
                style={[
                  styles.idChip,
                  {
                    backgroundColor: isDark
                      ? 'rgba(148,163,184,0.16)'
                      : `${accent}18`,
                  },
                ]}>
                <Text style={[styles.idText, {color: accent}]}>
                  {`#${playerId}`}
                </Text>
              </View>
            </View>

            <Pressable
              onPressIn={() => setIsPressed(true)}
              onPressOut={() => setIsPressed(false)}
              onPress={HandlePress}
              disabled={disabled}
              style={[
                styles.selectBtn,
                {
                  backgroundColor: disabled
                    ? isDark
                      ? 'rgba(100,116,139,0.45)'
                      : 'rgba(148,163,184,0.55)'
                    : isPressed
                      ? accent
                      : accent,
                  opacity: disabled ? 0.85 : isPressed ? 0.88 : 1,
                },
              ]}>
              <Text style={styles.selectText}>
                {disabled ? 'unavailable' : 'select'}
              </Text>
            </Pressable>
          </View>

          {disabled && !!disabledReason && (
            <Text style={styles.disabledReason}>{disabledReason}</Text>
          )}

          {stats.played > 0 && (
            <View
              style={[
                styles.statsBlock,
                {
                  borderTopColor: isDark
                    ? 'rgba(148,163,184,0.16)'
                    : 'rgba(15,23,42,0.08)',
                },
              ]}>
              <View style={styles.playedRow}>
                <Text style={styles.playedLabel}>{t('played')}</Text>
                <Text type="defaultSemiBold" style={styles.playedValue}>
                  {String(stats.played)}
                </Text>
              </View>
              <View style={styles.pillsRow}>
                <StatPill
                  label={t('all')}
                  wins={stats.wins}
                  played={stats.played}
                  accent={accent}
                  isDark={isDark}
                />
                <StatPill
                  label={t('singles')}
                  wins={stats.s_wins}
                  played={stats.s_played}
                  accent={accent}
                  isDark={isDark}
                />
                <StatPill
                  label={t('doubles')}
                  wins={stats.d_wins}
                  played={stats.d_played}
                  accent={accent}
                  isDark={isDark}
                />
              </View>
            </View>
          )}
        </View>
      </LinearGradient>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsModalVisible(false)}>
          {photo ? (
            <Image
              source={{uri: config.profileUrl + photo}}
              style={styles.modalImage}
              resizeMode="contain"
            />
          ) : null}
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
    borderRadius: 18,
    shadowOffset: {width: 0, height: 8},
    shadowRadius: 16,
    elevation: 4,
  },
  board: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  content: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    paddingLeft: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  subName: {
    opacity: 0.7,
    fontSize: 13,
    marginTop: 1,
  },
  idChip: {
    alignSelf: 'flex-start',
    marginTop: 6,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  idText: {
    fontSize: 11,
    fontWeight: '600',
  },
  selectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 92,
    alignItems: 'center',
  },
  selectText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  disabledReason: {
    marginTop: 10,
    fontSize: 12,
    color: '#D97706',
  },
  statsBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  playedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  playedLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  playedValue: {
    fontSize: 14,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  statRecord: {
    fontSize: 14,
  },
  statPct: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalImage: {
    width: 320,
    height: 320,
    borderRadius: 16,
  },
})
