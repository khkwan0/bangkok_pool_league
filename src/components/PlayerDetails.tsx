import React from 'react'
import {
  View,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native'
import {useLeague} from '@/hooks/useLeague'
import {ThemedText as Text} from '@/components/ThemedText'
import config from '@/config'
import {router} from 'expo-router'
import {useNavigation} from 'expo-router'
import {useTranslation} from 'react-i18next'
import {LinearGradient} from 'expo-linear-gradient'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'

const ACCENTS = [
  '#3B82F6',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#F43F5E',
  '#8B5CF6',
] as const

interface PlayerDetailsProps {
  playerId: number
}

function Chip({
  icon,
  label,
  color,
  background,
}: {
  icon: React.ComponentProps<typeof MCI>['name']
  label: string
  color: string
  background: string
}) {
  return (
    <View style={[styles.chip, {backgroundColor: background}]}>
      <MCI name={icon} size={13} color={color} />
      <Text style={[styles.chipText, {color}]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

function InfoRow({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentProps<typeof MCI>['name']
  label: string
  value: string
  accent: string
}) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, {backgroundColor: `${accent}22`}]}>
        <MCI name={icon} size={18} color={accent} />
      </View>
      <View style={{flex: 1, minWidth: 0}}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  )
}

function roleLabel(
  roleId: number | undefined,
  t: (key: string) => string,
): string | null {
  if (roleId === 2) return t('captain')
  if (roleId === 1) return t('assistants')
  return null
}

export default function PlayerDetails({playerId}: PlayerDetailsProps) {
  const league = useLeague()
  const {t} = useTranslation()
  const [playerInfo, setPlayerInfo] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const navigation = useNavigation()
  const accent = ACCENTS[5]

  React.useEffect(() => {
    async function fetchPlayerInfo() {
      try {
        setIsLoading(true)
        setError('')
        const info = await league.GetPlayerStatsInfo(playerId)
        setPlayerInfo(info)
      } catch (e) {
        setError(t('failed_to_load_player_info'))
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }

    if (playerId) {
      fetchPlayerInfo()
    }
  }, [playerId])

  React.useEffect(() => {
    navigation.setOptions({
      title: playerInfo?.name || playerInfo?.nickname || t('players'),
      headerShown: true,
    })
  }, [navigation, playerInfo, t])

  const ScreenBackdrop = (
    <LinearGradient
      colors={['#0B1220', '#111827', '#0F172A']}
      locations={[0, 0.55, 1]}
      start={{x: 0.2, y: 0}}
      end={{x: 0.9, y: 1}}
      style={StyleSheet.absoluteFillObject}
    />
  )

  if (isLoading) {
    return (
      <View style={styles.centered}>
        {ScreenBackdrop}
        <ActivityIndicator size="large" color={accent} />
        <Text style={styles.mutedText}>{t('loading')}</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.centered, {padding: 32}]}>
        {ScreenBackdrop}
        <View style={styles.emptyIcon}>
          <MCI name="alert-circle-outline" size={32} color="#A78BFA" />
        </View>
        <Text style={styles.emptyTitle}>{error}</Text>
      </View>
    )
  }

  if (!playerInfo) {
    return (
      <View style={[styles.centered, {padding: 32}]}>
        {ScreenBackdrop}
        <View style={styles.emptyIcon}>
          <MCI name="account-off-outline" size={32} color="#A78BFA" />
        </View>
        <Text style={styles.emptyTitle}>{t('no_players_found')}</Text>
      </View>
    )
  }

  const nickname =
    playerInfo.name || playerInfo.nickname || t('not_provided')
  const firstName =
    playerInfo.firstname || playerInfo.firstName || t('not_provided')
  const lastName =
    playerInfo.lastname || playerInfo.lastName || t('not_provided')
  const nationalityEn = playerInfo?.nationality?.en
  const nationalityTh = playerInfo?.nationality?.th
  const nationality = [nationalityEn, nationalityTh].filter(Boolean).join(' · ')
  const avatarUri = `${config.profileUrl}${
    playerInfo.pic ||
    (playerInfo.gender === 'Female'
      ? 'default_female.png'
      : 'default_male.png')
  }`
  const currentTeams = playerInfo.currentTeams || []
  const seasons = playerInfo.seasons || {}
  const seasonKeys = Object.keys(seasons)

  return (
    <View style={{flex: 1, backgroundColor: '#0B1220'}}>
      {ScreenBackdrop}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.board}>
          <View style={[styles.stripe, {backgroundColor: accent}]} />
          <View style={styles.hero}>
            <View style={styles.avatarRing}>
              <Image
                source={{uri: avatarUri}}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
            <View style={styles.nameRow}>
              <Text style={styles.playerTitle} numberOfLines={2}>
                {nickname}
              </Text>
              {playerInfo.flag ? (
                <Text style={styles.flag}>{playerInfo.flag}</Text>
              ) : null}
            </View>
            <View style={styles.chipsWrap}>
              <Chip
                icon="pound"
                label={`#${playerInfo.player_id ?? playerId}`}
                color={accent}
                background={`${accent}22`}
              />
              {nationalityEn ? (
                <Chip
                  icon="earth"
                  label={nationalityEn}
                  color="#E2E8F0"
                  background="rgba(148,163,184,0.16)"
                />
              ) : null}
            </View>
          </View>

          <View style={styles.infoCard}>
            <InfoRow
              icon="account-outline"
              label={t('first_name')}
              value={firstName}
              accent="#3B82F6"
            />
            <InfoRow
              icon="account"
              label={t('last_name')}
              value={lastName}
              accent="#06B6D4"
            />
            <InfoRow
              icon="flag-outline"
              label={t('nationality')}
              value={nationality || t('not_provided')}
              accent="#F59E0B"
            />
          </View>
        </View>

        <Pressable
          onPress={() =>
            router.push({
              pathname: './Player',
              params: {
                params: JSON.stringify({playerId}),
              },
            })
          }
          style={({pressed}) => ({
            opacity: pressed ? 0.92 : 1,
            transform: [{scale: pressed ? 0.985 : 1}],
            marginBottom: 20,
          })}>
          <View style={styles.ctaBoard}>
            <View style={[styles.stripe, {backgroundColor: '#3B82F6'}]} />
            <View style={styles.ctaRow}>
              <View style={[styles.ctaIcon, {backgroundColor: '#3B82F622'}]}>
                <MCI name="chart-box-outline" size={22} color="#60A5FA" />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text style={styles.ctaTitle}>{t('player_statistics')}</Text>
                <Text style={styles.ctaSubtitle}>{nickname}</Text>
              </View>
              <MCI
                name="chevron-right"
                size={22}
                color="rgba(226,232,240,0.45)"
              />
            </View>
          </View>
        </Pressable>

        <View style={[styles.sectionHeader, {marginTop: 16}]}>
          <Text style={styles.sectionTitle}>{t('teams')}</Text>
          <Chip
            icon="shield-outline"
            label={String(currentTeams.length)}
            color={accent}
            background={`${accent}22`}
          />
        </View>

        {currentTeams.length > 0 ? (
          currentTeams.map((team: any, index: number) => {
            const teamAccent = ACCENTS[index % ACCENTS.length]
            const role = roleLabel(team.team_role_id, t)
            return (
              <View key={`team-${team.id ?? index}`} style={styles.itemBoard}>
                <View
                  style={[styles.stripe, {backgroundColor: teamAccent}]}
                />
                <View style={styles.itemRow}>
                  <View
                    style={[
                      styles.itemMark,
                      {backgroundColor: `${teamAccent}22`},
                    ]}>
                    <Text style={[styles.itemLetter, {color: teamAccent}]}>
                      {(team.name || '?').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.itemBody}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {team.name}
                    </Text>
                    {role ? (
                      <View style={styles.chipsWrapLeft}>
                        <Chip
                          icon={
                            team.team_role_id === 2
                              ? 'shield-crown-outline'
                              : 'shield-account-outline'
                          }
                          label={role}
                          color={teamAccent}
                          background={`${teamAccent}22`}
                        />
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            )
          })
        ) : (
          <View style={styles.emptyCard}>
            <MCI
              name="account-group-outline"
              size={28}
              color="rgba(226,232,240,0.45)"
            />
            <Text style={styles.emptyCardText}>{t('not_provided')}</Text>
          </View>
        )}

        <View style={[styles.sectionHeader, {marginTop: 8}]}>
          <Text style={styles.sectionTitle}>{t('league_history')}</Text>
          <Chip
            icon="history"
            label={String(seasonKeys.length)}
            color="#F59E0B"
            background="rgba(245,158,11,0.18)"
          />
        </View>

        {seasonKeys.length > 0 ? (
          seasonKeys.map((season, seasonIdx) => {
            const seasonAccent = ACCENTS[seasonIdx % ACCENTS.length]
            const teamsInSeason = seasons[season] || {}
            return (
              <View
                key={`${season}_${seasonIdx}`}
                style={styles.historyBoard}>
                <View
                  style={[styles.stripe, {backgroundColor: seasonAccent}]}
                />
                <View style={styles.historyHeader}>
                  <Chip
                    icon="calendar"
                    label={`${t('season')} ${season}`}
                    color={seasonAccent}
                    background={`${seasonAccent}22`}
                  />
                </View>
                {Object.keys(teamsInSeason).map((team, teamIdx) => (
                  <View
                    key={`${team}_${teamIdx}`}
                    style={[
                      styles.historyRow,
                      teamIdx > 0 ? styles.historyRowBorder : null,
                    ]}>
                    <Text style={styles.historyTeam} numberOfLines={2}>
                      {team}
                    </Text>
                    <Chip
                      icon="billiards-rack"
                      label={`${teamsInSeason[team]} ${t('frames').toLowerCase()}`}
                      color="#E2E8F0"
                      background="rgba(148,163,184,0.16)"
                    />
                  </View>
                ))}
              </View>
            )
          })
        ) : (
          <View style={styles.emptyCard}>
            <MCI name="history" size={28} color="rgba(226,232,240,0.45)" />
            <Text style={styles.emptyCardText}>{t('not_provided')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  board: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    backgroundColor: 'rgba(15,23,42,0.92)',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    paddingLeft: 18,
    marginBottom: 16,
  },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  avatarRing: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
    marginBottom: 4,
    overflow: 'hidden',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  playerTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  flag: {
    fontSize: 22,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  chipsWrapLeft: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: '100%',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoCard: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
    backgroundColor: 'rgba(2,6,23,0.45)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    color: 'rgba(226,232,240,0.55)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  infoValue: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '600',
  },
  ctaBoard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    backgroundColor: 'rgba(15,23,42,0.92)',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingLeft: 18,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  ctaTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  ctaSubtitle: {
    color: 'rgba(226,232,240,0.55)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  itemBoard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    backgroundColor: 'rgba(15,23,42,0.92)',
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingLeft: 16,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  itemLetter: {
    fontSize: 18,
    fontWeight: '800',
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  itemName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  historyBoard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    backgroundColor: 'rgba(15,23,42,0.92)',
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingLeft: 16,
    marginBottom: 10,
  },
  historyHeader: {
    marginBottom: 4,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 10,
  },
  historyRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.12)',
  },
  historyTeam: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    backgroundColor: 'rgba(15,23,42,0.92)',
    padding: 28,
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  emptyCardText: {
    color: 'rgba(226,232,240,0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mutedText: {
    marginTop: 14,
    color: 'rgba(226,232,240,0.7)',
    fontSize: 14,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139,92,246,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
})
