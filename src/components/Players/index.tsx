import React, {useEffect, useRef, useState} from 'react'
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import TrieSearch from 'trie-search'
import {useLeague} from '@/hooks/useLeague'
import {useNavigation} from 'expo-router'
import {useTranslation} from 'react-i18next'
import PlayerCard from '@/components/Players/PlayerCard'
import {Player} from './types'
import {LinearGradient} from 'expo-linear-gradient'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'

type SearchablePlayer = Player & {player_id_str: string}

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

export default function Players() {
  const league = useLeague()
  const navigation = useNavigation()
  const {t} = useTranslation()
  const [players, setPlayers] = useState<Player[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const trie = useRef(
    new TrieSearch<SearchablePlayer>([
      'nickname',
      'firstname',
      'lastname',
      'player_id_str',
    ]),
  )

  useEffect(() => {
    navigation.setOptions({
      title: t('players'),
    })
  }, [navigation, t])

  useEffect(() => {
    fetchPlayers()
  }, [])

  useEffect(() => {
    const query = searchQuery.trim()
    if (query === '') {
      setFilteredPlayers(players)
    } else {
      setFilteredPlayers(trie.current.search(query))
    }
  }, [searchQuery, players])

  const fetchPlayers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError('')
      const response = await league.GetAllPlayers()
      if (response && Array.isArray(response.data)) {
        const playerData = response.data as Player[]
        const searchable: SearchablePlayer[] = playerData.map(player => ({
          ...player,
          player_id_str: String(player.player_id),
        }))
        trie.current = new TrieSearch<SearchablePlayer>([
          'nickname',
          'firstname',
          'lastname',
          'player_id_str',
        ])
        trie.current.addAll(searchable)
        setPlayers(playerData)
        if (searchQuery.trim() === '') {
          setFilteredPlayers(playerData)
        } else {
          setFilteredPlayers(trie.current.search(searchQuery.trim()))
        }
      }
    } catch (err) {
      console.error('Failed to fetch players:', err)
      setError(t('failed_to_fetch_players'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
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

  if (loading) {
    return (
      <View style={styles.centered}>
        {ScreenBackdrop}
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.mutedText}>{t('loading')}</Text>
      </View>
    )
  }

  if (error && players.length === 0) {
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

  return (
    <View style={{flex: 1, backgroundColor: '#0B1220'}}>
      {ScreenBackdrop}
      <View style={styles.headerWrap}>
        <View style={styles.board}>
          <View style={[styles.stripe, {backgroundColor: '#8B5CF6'}]} />
          <View style={styles.chipsWrap}>
            <Chip
              icon="account-group"
              label={`${players.length} ${t('players').toLowerCase()}`}
              color="#A78BFA"
              background="rgba(139,92,246,0.22)"
            />
            {searchQuery.trim() ? (
              <Chip
                icon="filter-outline"
                label={`${filteredPlayers.length}`}
                color="#E2E8F0"
                background="rgba(148,163,184,0.16)"
              />
            ) : null}
          </View>
        </View>

        <View style={styles.searchBoard}>
          <View style={[styles.stripe, {backgroundColor: '#3B82F6'}]} />
          <View style={styles.searchRow}>
            <MCI name="magnify" size={20} color="rgba(226,232,240,0.55)" />
            <TextInput
              style={styles.searchInput}
              placeholder={t('search_player')}
              placeholderTextColor="rgba(148,163,184,0.55)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              spellCheck={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              keyboardType="default"
              returnKeyType="search"
              blurOnSubmit={false}
            />
            {searchQuery.length > 0 ? (
              <MCI
                name="close-circle"
                size={18}
                color="rgba(148,163,184,0.55)"
                onPress={() => setSearchQuery('')}
              />
            ) : null}
          </View>
        </View>
      </View>
      <FlatList
        data={filteredPlayers}
        refreshing={refreshing}
        onRefresh={() => fetchPlayers(true)}
        renderItem={({item, index}) => (
          <PlayerCard player={item} index={index} />
        )}
        keyExtractor={item => item.player_id.toString()}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <View style={styles.emptyIcon}>
              <MCI name="account-search-outline" size={32} color="#A78BFA" />
            </View>
            <Text style={styles.emptyTitle}>{t('no_players_found')}</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 28,
    flexGrow: 1,
  },
  headerWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
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
  searchBoard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    backgroundColor: 'rgba(15,23,42,0.92)',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 4,
    paddingLeft: 18,
  },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 10,
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
  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
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
