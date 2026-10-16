import React, {useEffect, useState} from 'react'
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import {useLeague} from '@/hooks'
import {useTranslation} from 'react-i18next'
import {useLocalSearchParams, useNavigation, router} from 'expo-router'
import config from '@/config'
import {useLeagueContext} from '@/context/LeagueContext'
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

type Team = {
  id: number
  name: string
  season_id: number
}

type Venue = {
  id: number
  name: string
  teams: Team[]
  logo?: string
  location?: string
  latitude?: number
  longitude?: number
  plus?: string
  phone?: string
  email?: string
  website?: string
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
      <MCI name={icon} size={12} color={color} />
      <Text style={[styles.chipText, {color}]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

function ContactAction({
  icon,
  label,
  value,
  accent,
  onPress,
}: {
  icon: React.ComponentProps<typeof MCI>['name']
  label: string
  value: string
  accent: string
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.actionTile,
        {opacity: pressed ? 0.85 : 1},
      ]}>
      <View style={[styles.actionIcon, {backgroundColor: `${accent}22`}]}>
        <MCI name={icon} size={18} color={accent} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionValue} numberOfLines={1}>
        {value}
      </Text>
    </Pressable>
  )
}

export default function Venue() {
  const [venue, setVenue] = useState<Venue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useLocalSearchParams()
  const {t} = useTranslation()
  const navigation = useNavigation()
  const league = useLeague()
  const {state} = useLeagueContext()
  const currentSeason = state.season
  const accent = ACCENTS[0]

  const venueId = params.params
    ? JSON.parse(params.params as string).venueId
    : null

  useEffect(() => {
    navigation.setOptions({
      title: venue?.name || t('venue'),
    })
  }, [navigation, venue, t])

  useEffect(() => {
    async function loadVenueDetails() {
      if (!venueId) return

      try {
        const response = await league.GetVenues()
        const list = Array.isArray(response) ? response : []
        const seasonId = Number(currentSeason)
        const venueData = list.find((v: Venue) => v.id === venueId)
        if (venueData) {
          const filteredTeams =
            venueData.teams?.filter(
              (team: Team) => Number(team.season_id) === seasonId,
            ) || []
          setVenue({...venueData, teams: filteredTeams})
        }
      } catch (error) {
        console.error('Failed to load venue details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVenueDetails()
  }, [venueId, currentSeason])

  const handleOpenMaps = () => {
    if (venue?.latitude && venue?.longitude) {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`,
      )
    } else if (venue?.plus) {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.plus)}`,
      )
    } else if (venue?.location) {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.location)}`,
      )
    }
  }

  const handleOpenWebsite = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return
    const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    void Linking.openURL(url)
  }

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

  if (!venue) {
    return (
      <View style={[styles.centered, {padding: 24}]}>
        {ScreenBackdrop}
        <Text style={styles.emptyTitle}>{t('venue_not_found')}</Text>
      </View>
    )
  }

  const locationText = venue.location
    ? venue.location
    : venue.latitude && venue.longitude
      ? `${venue.latitude}, ${venue.longitude}`
      : venue.plus || ''
  const canOpenMaps = Boolean(
    (venue.latitude && venue.longitude) || venue.plus || venue.location,
  )
  const teamCount = venue.teams.length

  const actions = [
    venue.phone
      ? {
          key: 'phone',
          icon: 'phone' as const,
          label: t('phone'),
          value: venue.phone,
          accent: '#10B981',
          onPress: () => Linking.openURL(`tel:${venue.phone}`),
        }
      : null,
    venue.email
      ? {
          key: 'email',
          icon: 'email' as const,
          label: t('email'),
          value: venue.email,
          accent: '#06B6D4',
          onPress: () => Linking.openURL(`mailto:${venue.email}`),
        }
      : null,
    venue.website
      ? {
          key: 'web',
          icon: 'web' as const,
          label: t('venue_website'),
          value: venue.website.replace(/^https?:\/\//i, ''),
          accent: '#8B5CF6',
          onPress: () => handleOpenWebsite(venue.website!),
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string
    icon: React.ComponentProps<typeof MCI>['name']
    label: string
    value: string
    accent: string
    onPress: () => void
  }>

  return (
    <View style={{flex: 1, backgroundColor: '#0B1220'}}>
      {ScreenBackdrop}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.board}>
          <View style={[styles.stripe, {backgroundColor: accent}]} />

          <View style={styles.heroRow}>
            {venue.logo ? (
              <View style={styles.logoRing}>
                <Image
                  source={{uri: config.logoUrl + venue.logo}}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={[styles.logoRing, styles.logoPlaceholder]}>
                <Text style={styles.logoLetter}>
                  {venue.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.heroMeta}>
              <Text style={styles.venueTitle} numberOfLines={2}>
                {venue.name}
              </Text>
              <View style={styles.chipsWrap}>
                <Chip
                  icon="calendar"
                  label={`${t('season')} ${currentSeason}`}
                  color="#E2E8F0"
                  background="rgba(148,163,184,0.16)"
                />
                <Chip
                  icon="account-group"
                  label={`${teamCount} ${t('teams').toLowerCase()}`}
                  color={accent}
                  background={`${accent}22`}
                />
              </View>
            </View>
          </View>

          {(locationText || actions.length > 0) && (
            <View style={styles.contactBlock}>
              {locationText ? (
                <Pressable
                  onPress={canOpenMaps ? handleOpenMaps : undefined}
                  disabled={!canOpenMaps}
                  style={({pressed}) => [
                    styles.addressRow,
                    {opacity: pressed && canOpenMaps ? 0.85 : 1},
                  ]}>
                  <View
                    style={[
                      styles.addressIcon,
                      {backgroundColor: 'rgba(245,158,11,0.14)'},
                    ]}>
                    <MCI name="map-marker-radius" size={18} color="#F59E0B" />
                  </View>
                  <View style={{flex: 1, minWidth: 0}}>
                    <Text style={styles.contactLabel}>{t('venue_address')}</Text>
                    <Text
                      style={[
                        styles.addressValue,
                        canOpenMaps ? styles.contactLink : null,
                      ]}
                      numberOfLines={2}>
                      {locationText}
                    </Text>
                  </View>
                  {canOpenMaps ? (
                    <MCI
                      name="directions"
                      size={18}
                      color="rgba(226,232,240,0.45)"
                    />
                  ) : null}
                </Pressable>
              ) : null}

              {actions.length > 0 ? (
                <View style={styles.actionsGrid}>
                  {actions.map(action => (
                    <ContactAction
                      key={action.key}
                      icon={action.icon}
                      label={action.label}
                      value={action.value}
                      accent={action.accent}
                      onPress={action.onPress}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('teams')}</Text>
          <Chip
            icon="shield-outline"
            label={String(teamCount)}
            color={accent}
            background={`${accent}22`}
          />
        </View>

        {teamCount > 0 ? (
          <View style={styles.teamsGrid}>
            {venue.teams.map((team, index) => {
              const teamAccent = ACCENTS[index % ACCENTS.length]
              return (
                <Pressable
                  key={team.id}
                  onPress={() =>
                    router.push({
                      pathname: './Venue/Team',
                      params: {params: JSON.stringify({teamId: team.id})},
                    })
                  }
                  style={({pressed}) => [
                    styles.teamTile,
                    {
                      opacity: pressed ? 0.92 : 1,
                      transform: [{scale: pressed ? 0.985 : 1}],
                    },
                  ]}>
                  <View
                    style={[styles.teamStripe, {backgroundColor: teamAccent}]}
                  />
                  <View
                    style={[
                      styles.teamMark,
                      {backgroundColor: `${teamAccent}22`},
                    ]}>
                    <Text style={[styles.teamLetter, {color: teamAccent}]}>
                      {team.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.teamName} numberOfLines={2}>
                    {team.name}
                  </Text>
                  <MCI
                    name="chevron-right"
                    size={18}
                    color="rgba(226,232,240,0.4)"
                  />
                </Pressable>
              )
            })}
          </View>
        ) : (
          <View style={styles.emptyTeams}>
            <MCI
              name="account-group-outline"
              size={28}
              color="rgba(226,232,240,0.45)"
            />
            <Text style={styles.emptyTeamsText}>
              {t('no_teams_in_current_season')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },
  board: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    backgroundColor: 'rgba(15,23,42,0.92)',
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 16,
    marginBottom: 18,
  },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoRing: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  logoLetter: {
    fontSize: 28,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  heroMeta: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  venueTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    maxWidth: '100%',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contactBlock: {
    marginTop: 14,
    gap: 10,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
    backgroundColor: 'rgba(2,6,23,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  addressIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    color: 'rgba(226,232,240,0.55)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  addressValue: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '600',
  },
  contactLink: {
    color: '#93C5FD',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionTile: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
    backgroundColor: 'rgba(2,6,23,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
  },
  actionIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  actionLabel: {
    color: 'rgba(226,232,240,0.5)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionValue: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },
  teamsGrid: {
    gap: 8,
  },
  teamTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    backgroundColor: 'rgba(15,23,42,0.92)',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingLeft: 14,
  },
  teamStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  teamMark: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  teamLetter: {
    fontSize: 15,
    fontWeight: '800',
  },
  teamName: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyTeams: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    backgroundColor: 'rgba(15,23,42,0.92)',
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyTeamsText: {
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
  emptyTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
})
