import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import Button from '@/components/Button'
import {useMiniLeagues} from '@/hooks/useMiniLeagues'
import {useTheme} from 'expo-router/react-navigation'
import {router, useLocalSearchParams, useFocusEffect} from 'expo-router'
import React from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native'

type Tab = 'home' | 'copy' | 'match' | 'standings' | 'stats'

export default function MiniLeagueDetailScreen() {
  const {id} = useLocalSearchParams<{id: string}>()
  const miniId = Number(id)
  const api = useMiniLeagues()
  const {colors} = useTheme()
  const [tab, setTab] = React.useState<Tab>('home')
  const [loading, setLoading] = React.useState(true)
  const [mini, setMini] = React.useState<any>(null)
  const [members, setMembers] = React.useState<any[]>([])
  const [teams, setTeams] = React.useState<any[]>([])
  const [formats, setFormats] = React.useState<any[]>([])
  const [matches, setMatches] = React.useState<any[]>([])
  const [standings, setStandings] = React.useState<any[]>([])
  const [playerStats, setPlayerStats] = React.useState<any[]>([])
  const [canonicalTeams, setCanonicalTeams] = React.useState<any[]>([])
  const [canonicalFormats, setCanonicalFormats] = React.useState<any[]>([])
  const [canonicalPlayers, setCanonicalPlayers] = React.useState<any[]>([])
  const [playerQuery, setPlayerQuery] = React.useState('')
  const [homeTeamId, setHomeTeamId] = React.useState<number | null>(null)
  const [awayTeamId, setAwayTeamId] = React.useState<number | null>(null)
  const [formatId, setFormatId] = React.useState<number | null>(null)
  const [matchDate, setMatchDate] = React.useState(
    new Date().toISOString().slice(0, 10),
  )
  const [selectedHomePlayers, setSelectedHomePlayers] = React.useState<number[]>(
    [],
  )
  const [selectedAwayPlayers, setSelectedAwayPlayers] = React.useState<number[]>(
    [],
  )
  const [matchMode, setMatchMode] = React.useState<'teams' | 'pickup'>('teams')

  const isAdmin = Boolean(mini?.is_admin)

  const refresh = React.useCallback(async () => {
    if (!miniId) return
    const [m, mem, t, f, mt] = await Promise.all([
      api.get(miniId),
      api.listMembers(miniId),
      api.listTeams(miniId),
      api.listMatchFormats(miniId),
      api.listMatches(miniId),
    ])
    if (m?.status === 'ok') setMini(m.data)
    if (mem?.status === 'ok') setMembers(mem.data || [])
    if (t?.status === 'ok') setTeams(t.data || [])
    if (f?.status === 'ok') setFormats(f.data || [])
    if (mt?.status === 'ok') setMatches(mt.data || [])
  }, [miniId])

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true)
      refresh().finally(() => setLoading(false))
    }, [refresh]),
  )

  async function loadCopyPickers() {
    const [ct, cf, cp] = await Promise.all([
      api.browseCanonical(miniId, 'teams'),
      api.browseCanonical(miniId, 'match_formats'),
      api.browseCanonical(miniId, 'players', playerQuery ? {q: playerQuery} : {}),
    ])
    if (ct?.status === 'ok') setCanonicalTeams(ct.data || [])
    if (cf?.status === 'ok') setCanonicalFormats(cf.data || [])
    if (cp?.status === 'ok') setCanonicalPlayers(cp.data || [])
  }

  async function loadStandings() {
    const res = await api.standings(miniId)
    if (res?.status === 'ok') setStandings(res.data || [])
  }

  async function loadStats() {
    const res = await api.playerStats(miniId)
    if (res?.status === 'ok') setPlayerStats(res.data || [])
  }

  React.useEffect(() => {
    if (tab === 'copy' && isAdmin) loadCopyPickers()
    if (tab === 'match' && isAdmin) {
      api.browseCanonical(miniId, 'match_formats').then(cf => {
        if (cf?.status === 'ok') setCanonicalFormats(cf.data || [])
      })
    }
    if (tab === 'standings') loadStandings()
    if (tab === 'stats') loadStats()
  }, [tab])

  async function copyTeam(teamId: number) {
    const res = await api.copy(miniId, {kind: 'team', team_id: teamId})
    if (res?.status === 'ok') {
      await refresh()
      Alert.alert('Copied', 'Team added to this mini league')
    } else {
      Alert.alert('Error', res?.error || 'Copy failed')
    }
  }

  async function copyFormat(matchFormatId: number) {
    const res = await api.copy(miniId, {
      kind: 'match_format',
      match_format_id: matchFormatId,
    })
    if (res?.status === 'ok') {
      await refresh()
      Alert.alert('Copied', 'Match format added')
    } else {
      Alert.alert('Error', res?.error || 'Copy failed')
    }
  }

  async function copyPlayer(playerId: number) {
    const res = await api.copy(miniId, {
      kind: 'players',
      player_ids: [playerId],
    })
    if (res?.status === 'ok') {
      await refresh()
      Alert.alert('Added', 'Player added to mini league')
    } else {
      Alert.alert('Error', res?.error || 'Copy failed')
    }
  }

  async function promoteAdmin(playerId: number) {
    const res = await api.addAdmin(miniId, playerId)
    if (res?.status === 'ok') {
      await refresh()
    } else {
      Alert.alert('Error', res?.error || 'Failed')
    }
  }

  function togglePlayer(
    list: number[],
    setList: (v: number[]) => void,
    playerId: number,
  ) {
    setList(
      list.includes(playerId)
        ? list.filter(id => id !== playerId)
        : [...list, playerId],
    )
  }

  async function createMatch() {
    const payload: any = {
      date: matchDate,
      match_format_id: formatId,
    }
    if (matchMode === 'teams') {
      payload.home_team_id = homeTeamId
      payload.away_team_id = awayTeamId
    } else {
      payload.home_player_ids = selectedHomePlayers
      payload.away_player_ids = selectedAwayPlayers
    }
    if (!payload.match_format_id) {
      Alert.alert('Missing format', 'Select a match format')
      return
    }
    const res = await api.createMatch(miniId, payload)
    if (res?.status === 'ok' && res.data?.id) {
      await refresh()
      router.push({
        pathname: '/Match',
        params: {params: JSON.stringify({matchId: res.data.id})},
      })
    } else {
      Alert.alert('Error', res?.error || 'Could not create match')
    }
  }

  if (loading || !mini) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    )
  }

  if (mini.member_status === 'pending') {
    return (
      <View className="flex-1 p-4 justify-center">
        <Text className="text-xl font-semibold mb-2">{mini.name}</Text>
        <Text className="mb-4 opacity-70">You have been invited.</Text>
        <Button
          onPress={async () => {
            await api.respondInvite(miniId, 'accept')
            await refresh()
          }}>
          <Text className="text-white">Accept invite</Text>
        </Button>
      </View>
    )
  }

  const tabs: {key: Tab; label: string; adminOnly?: boolean}[] = [
    {key: 'home', label: 'Home'},
    {key: 'copy', label: 'Add', adminOnly: true},
    {key: 'match', label: 'Match', adminOnly: true},
    {key: 'standings', label: 'Table'},
    {key: 'stats', label: 'Stats'},
  ]

  return (
    <View className="flex-1">
      <View className="px-4 pt-3 pb-2">
        <Text className="text-xl font-semibold">{mini.name}</Text>
        <Text className="text-sm opacity-70">
          {isAdmin ? 'You are an admin' : 'Member'}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="max-h-12 px-2 mb-2">
        {tabs
          .filter(t => !t.adminOnly || isAdmin)
          .map(t => (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              className="px-3 py-2 mx-1 rounded-full"
              style={{
                backgroundColor:
                  tab === t.key ? colors.primary || '#2563eb' : colors.card,
              }}>
              <Text
                style={{
                  color: tab === t.key ? '#fff' : colors.text,
                  fontWeight: '600',
                }}>
                {t.label}
              </Text>
            </Pressable>
          ))}
      </ScrollView>

      <ScrollView className="flex-1 px-4">
        {tab === 'home' && (
          <View className="pb-8">
            <Text className="font-semibold mb-2">Members</Text>
            {members.map(m => (
              <View
                key={m.player_id}
                className="flex-row justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                <Text>
                  {m.nickname}
                  {m.is_admin ? ' · admin' : ''}
                  {m.status !== 'active' ? ` · ${m.status}` : ''}
                </Text>
                {isAdmin && !m.is_admin && m.status === 'active' ? (
                  <Pressable onPress={() => promoteAdmin(m.player_id)}>
                    <Text style={{color: colors.primary}}>Make admin</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
            <Text className="font-semibold mt-6 mb-2">Teams</Text>
            {teams.length === 0 ? (
              <Text className="opacity-60">No teams copied yet.</Text>
            ) : (
              teams.map(t => (
                <Text key={t.id} className="py-1">
                  {t.short_name || t.name}
                </Text>
              ))
            )}
            <Text className="font-semibold mt-6 mb-2">Matches</Text>
            {matches.length === 0 ? (
              <Text className="opacity-60">No matches yet.</Text>
            ) : (
              matches.map(m => (
                <Pressable
                  key={m.id}
                  className="py-3 border-b border-slate-200 dark:border-slate-700"
                  onPress={() =>
                    router.push({
                      pathname: '/Match',
                      params: {params: JSON.stringify({matchId: m.id})},
                    })
                  }>
                  <Text>
                    {m.home_team_name} vs {m.away_team_name}
                  </Text>
                  <Text className="text-sm opacity-70">
                    {String(m.date).slice(0, 10)}
                    {m.status_id === 3
                      ? ` · ${m.home_frames}-${m.away_frames}`
                      : ' · open'}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        )}

        {tab === 'copy' && isAdmin && (
          <View className="pb-8">
            <Text className="opacity-70 mb-3">
              Copy only what you select from the main league.
            </Text>
            <Text className="font-semibold mb-2">Teams</Text>
            {canonicalTeams.map(t => (
              <Pressable
                key={t.id}
                onPress={() => copyTeam(t.id)}
                className="py-2 border-b border-slate-200 dark:border-slate-700">
                <Text>{t.short_name || t.name}</Text>
                <Text className="text-xs opacity-60">Tap to copy</Text>
              </Pressable>
            ))}
            <Text className="font-semibold mt-6 mb-2">Match formats</Text>
            {canonicalFormats.map(f => (
              <Pressable
                key={f.id}
                onPress={() => copyFormat(f.id)}
                className="py-2 border-b border-slate-200 dark:border-slate-700">
                <Text>
                  {f.name} ({f.game_type})
                </Text>
              </Pressable>
            ))}
            <Text className="font-semibold mt-6 mb-2">Players</Text>
            <TextInput
              value={playerQuery}
              onChangeText={setPlayerQuery}
              onSubmitEditing={loadCopyPickers}
              placeholder="Search players"
              placeholderTextColor={colors.text + '66'}
              style={{
                borderWidth: 1,
                borderColor: '#8884',
                borderRadius: 8,
                padding: 10,
                color: colors.text,
                marginBottom: 8,
              }}
            />
            <Pressable onPress={loadCopyPickers} className="mb-2">
              <Text style={{color: colors.primary}}>Search</Text>
            </Pressable>
            {canonicalPlayers.map(p => (
              <Pressable
                key={p.id}
                onPress={() => copyPlayer(p.id)}
                className="py-2 border-b border-slate-200 dark:border-slate-700">
                <Text>{p.nickname}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {tab === 'match' && isAdmin && (
          <View className="pb-8">
            <View className="flex-row mb-3">
              <Pressable
                onPress={() => setMatchMode('teams')}
                className="mr-3 px-3 py-2 rounded-lg"
                style={{
                  backgroundColor:
                    matchMode === 'teams' ? colors.primary : '#8883',
                }}>
                <Text style={{color: '#fff'}}>Team vs team</Text>
              </Pressable>
              <Pressable
                onPress={() => setMatchMode('pickup')}
                className="px-3 py-2 rounded-lg"
                style={{
                  backgroundColor:
                    matchMode === 'pickup' ? colors.primary : '#8883',
                }}>
                <Text style={{color: '#fff'}}>Pickup sides</Text>
              </Pressable>
            </View>

            <Text className="mb-1">Date (YYYY-MM-DD)</Text>
            <TextInput
              value={matchDate}
              onChangeText={setMatchDate}
              style={{
                borderWidth: 1,
                borderColor: '#8884',
                borderRadius: 8,
                padding: 10,
                color: colors.text,
                marginBottom: 12,
              }}
            />

            <Text className="font-semibold mb-2">Format</Text>
            {formats.length === 0 ? (
              <Text className="opacity-60 mb-3">
                Copy a match format first (Add tab), or pick a canonical one
                below when creating — formats copy lazily on match create too.
              </Text>
            ) : null}
            {[...formats, ...canonicalFormats.filter(
              cf => !formats.some(f => f.copied_from_id === cf.id),
            )].map(f => (
              <Pressable
                key={`fmt-${f.id}`}
                onPress={() => setFormatId(f.id)}
                className="py-2">
                <Text>
                  {formatId === f.id ? '✓ ' : ''}
                  {f.name} ({f.game_type})
                </Text>
              </Pressable>
            ))}

            {matchMode === 'teams' ? (
              <>
                <Text className="font-semibold mt-4 mb-2">Home team</Text>
                {teams.map(t => (
                  <Pressable key={`h-${t.id}`} onPress={() => setHomeTeamId(t.id)}>
                    <Text>
                      {homeTeamId === t.id ? '✓ ' : ''}
                      {t.short_name || t.name}
                    </Text>
                  </Pressable>
                ))}
                <Text className="font-semibold mt-4 mb-2">Away team</Text>
                {teams.map(t => (
                  <Pressable key={`a-${t.id}`} onPress={() => setAwayTeamId(t.id)}>
                    <Text>
                      {awayTeamId === t.id ? '✓ ' : ''}
                      {t.short_name || t.name}
                    </Text>
                  </Pressable>
                ))}
              </>
            ) : (
              <>
                <Text className="font-semibold mt-4 mb-2">Home players</Text>
                {members
                  .filter(m => m.status === 'active')
                  .map(m => (
                    <Pressable
                      key={`hp-${m.player_id}`}
                      onPress={() =>
                        togglePlayer(
                          selectedHomePlayers,
                          setSelectedHomePlayers,
                          m.player_id,
                        )
                      }>
                      <Text>
                        {selectedHomePlayers.includes(m.player_id) ? '✓ ' : ''}
                        {m.nickname}
                      </Text>
                    </Pressable>
                  ))}
                <Text className="font-semibold mt-4 mb-2">Away players</Text>
                {members
                  .filter(m => m.status === 'active')
                  .map(m => (
                    <Pressable
                      key={`ap-${m.player_id}`}
                      onPress={() =>
                        togglePlayer(
                          selectedAwayPlayers,
                          setSelectedAwayPlayers,
                          m.player_id,
                        )
                      }>
                      <Text>
                        {selectedAwayPlayers.includes(m.player_id) ? '✓ ' : ''}
                        {m.nickname}
                      </Text>
                    </Pressable>
                  ))}
              </>
            )}

            <View className="mt-6 mb-10">
              <Button onPress={createMatch}>
                <Text className="text-white">Create & open scoresheet</Text>
              </Button>
            </View>
          </View>
        )}

        {tab === 'standings' && (
          <View className="pb-8">
            {standings.length === 0 ? (
              <Text className="opacity-60">No standings yet.</Text>
            ) : (
              standings.map(div => (
                <View key={div.division} className="mb-4">
                  <Text className="font-semibold mb-2">{div.division}</Text>
                  {div.teams.map((t: any, idx: number) => (
                    <Text key={t.teamId} className="py-1">
                      {idx + 1}. {t.name} — {t.points} pts, {t.frames} frames (
                      {t.played} played)
                    </Text>
                  ))}
                </View>
              ))
            )}
          </View>
        )}

        {tab === 'stats' && (
          <View className="pb-8">
            {playerStats.length === 0 ? (
              <Text className="opacity-60">No player stats yet.</Text>
            ) : (
              playerStats.map(p => (
                <Text key={p.player_id} className="py-2">
                  {p.nickname}: {p.won}/{p.played} ({p.winp}%)
                </Text>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
