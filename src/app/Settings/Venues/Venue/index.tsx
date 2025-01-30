import {useEffect, useState} from 'react'
import {Image, ScrollView, Linking, Pressable} from 'react-native'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {useLeague} from '@/hooks'
import {useTranslation} from 'react-i18next'
import {useLocalSearchParams, useNavigation, router} from 'expo-router'
import config from '@/app/config'
import {useTheme} from '@react-navigation/native'
import {useLeagueContext} from '@/context/LeagueContext'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import Feather from '@expo/vector-icons/Feather'

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

const ContactItem = ({
  icon,
  text,
  onPress,
  type,
}: {
  icon: React.ReactNode
  text: string
  onPress?: () => void
  type?: 'link' | 'text'
}) => {
  const {colors} = useTheme()
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center py-2">
      <View className="w-8">{icon}</View>
      <Text
        className={type === 'link' ? 'text-blue-500' : ''}
        style={type === 'link' ? {textDecorationLine: 'underline'} : {}}>
        {text}
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
  const {colors} = useTheme()
  const {state} = useLeagueContext()
  const currentSeason = state.season

  // Parse the venue ID from params
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
        const venueData = response.find((v: Venue) => v.id === venueId)
        if (venueData) {
          const filteredTeams =
            venueData.teams?.filter(
              (team: Team) => team.season_id === currentSeason,
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
      const url = `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`
      Linking.openURL(url)
    } else if (venue?.plus) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        venue.plus,
      )}`
      Linking.openURL(url)
    }
  }

  const handleCall = () => {
    if (venue?.phone) {
      Linking.openURL(`tel:${venue.phone}`)
    }
  }

  const handleEmail = () => {
    if (venue?.email) {
      Linking.openURL(`mailto:${venue.email}`)
    }
  }

  const handleWebsite = () => {
    if (venue?.website) {
      Linking.openURL(venue.website)
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>{t('loading')}</Text>
      </View>
    )
  }

  if (!venue) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-gray-500">
          {t('venue_not_found')}
        </Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1">
      <View className="p-4">
        {/* Venue Logo and Name */}
        <View className="items-center mb-6">
          {venue.logo ? (
            <Image
              source={{uri: config.logoUrl + venue.logo}}
              className="w-24 h-24 mb-2"
              resizeMode="contain"
            />
          ) : (
            <View className="w-24 h-24 mb-2 bg-gray-800/20 rounded-full items-center justify-center">
              <Text className="text-2xl font-bold">{venue.name.charAt(0)}</Text>
            </View>
          )}
          <Text className="text-xl font-bold mb-4">{venue.name}</Text>

          {/* Contact Information */}
          <View className="w-full bg-gray-800/10 rounded-xl p-4">
            {(venue.location ||
              (venue.latitude && venue.longitude) ||
              venue.plus) && (
              <ContactItem
                icon={
                  <MCI name="map-marker-radius" size={24} color={colors.text} />
                }
                text={
                  venue.location
                    ? venue.location
                    : venue.latitude && venue.longitude
                      ? `${venue.latitude}, ${venue.longitude}`
                      : venue.plus || ''
                }
                onPress={handleOpenMaps}
                type="link"
              />
            )}
            {venue.phone && (
              <ContactItem
                icon={<Feather name="phone" size={24} color={colors.text} />}
                text={venue.phone}
                onPress={handleCall}
                type="link"
              />
            )}
            {venue.email && (
              <ContactItem
                icon={<MCI name="email" size={24} color={colors.text} />}
                text={venue.email}
                onPress={handleEmail}
                type="link"
              />
            )}
            {venue.website && (
              <ContactItem
                icon={<MCI name="web" size={24} color={colors.text} />}
                text={venue.website}
                onPress={handleWebsite}
                type="link"
              />
            )}
          </View>
        </View>

        {/* Teams Section */}
        <View className="mt-4">
          <Text
            className="text-lg font-bold mb-4"
            style={{color: colors.primary}}>
            {t('teams')} ({venue.teams.length})
          </Text>
          {venue.teams.length > 0 ? (
            venue.teams.map(team => (
              <Pressable
                key={team.id}
                onPress={() =>
                  router.push({
                    pathname: './Venue/team',
                    params: {params: JSON.stringify({teamId: team.id})},
                  })
                }
                className="mb-3">
                <View className="flex-row items-center justify-between bg-gray-800/20 p-4 rounded-lg">
                  <Text className="text-lg">{team.name}</Text>
                  <MCI name="chevron-right" size={24} color={colors.text} />
                </View>
              </Pressable>
            ))
          ) : (
            <Text className="text-center text-gray-500">
              {t('no_teams_in_current_season')}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  )
}
