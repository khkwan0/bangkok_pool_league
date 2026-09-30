import {Image, Pressable, StyleSheet, View} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import {Player} from './types'
import {router} from 'expo-router'
import config from '@/config'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'

const ACCENTS = [
  '#3B82F6',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#F43F5E',
  '#8B5CF6',
] as const

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

export default function PlayerCard({
  player,
  index = 0,
}: {
  player: Player
  index?: number
}) {
  const accent = ACCENTS[index % ACCENTS.length]
  const fullName = [player.firstname, player.lastname]
    .filter(Boolean)
    .join(' ')
  const initial = (player.nickname || player.firstname || '?')
    .charAt(0)
    .toUpperCase()

  function HandlePlayerPress() {
    router.push({
      pathname: '/Settings/Players/PlayerInfo',
      params: {params: JSON.stringify({playerId: player.player_id})},
    })
  }

  return (
    <View style={styles.rowWrap}>
      <Pressable
        onPress={HandlePlayerPress}
        style={({pressed}) => ({
          opacity: pressed ? 0.92 : 1,
          transform: [{scale: pressed ? 0.985 : 1}],
        })}>
        <View style={styles.board}>
          <View style={[styles.stripe, {backgroundColor: accent}]} />
          <View style={styles.row}>
            {player.profile_picture ? (
              <View style={styles.logoWell}>
                <Image
                  source={{uri: config.profileUrl + player.profile_picture}}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={[styles.iconWell, {backgroundColor: `${accent}22`}]}>
                <Text style={[styles.initial, {color: accent}]}>{initial}</Text>
              </View>
            )}
            <View style={styles.rowBody}>
              <View style={styles.nameRow}>
                <Text style={styles.playerName} numberOfLines={1}>
                  {player.nickname}
                </Text>
                {player.flag ? (
                  <Text style={styles.flag}>{player.flag}</Text>
                ) : null}
              </View>
              <View style={styles.chipsWrap}>
                <Chip
                  icon="pound"
                  label={`#${player.player_id}`}
                  color={accent}
                  background={`${accent}22`}
                />
                {fullName ? (
                  <Chip
                    icon="account-outline"
                    label={fullName}
                    color="#E2E8F0"
                    background="rgba(148,163,184,0.16)"
                  />
                ) : null}
              </View>
            </View>
            <MCI name="chevron-right" size={22} color="rgba(226,232,240,0.45)" />
          </View>
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  rowWrap: {
    marginBottom: 14,
  },
  board: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    backgroundColor: 'rgba(15,23,42,0.92)',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingLeft: 18,
  },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWell: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  logoWell: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
    overflow: 'hidden',
  },
  avatar: {
    width: 46,
    height: 46,
  },
  initial: {
    fontSize: 18,
    fontWeight: '800',
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerName: {
    flexShrink: 1,
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  flag: {
    fontSize: 16,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: '100%',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
})
