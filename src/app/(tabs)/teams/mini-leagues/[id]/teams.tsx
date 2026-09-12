import Button from '@/components/Button'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useMiniLeagues} from '@/hooks/useMiniLeagues'
import {useTheme} from 'expo-router/react-navigation'
import {router, useFocusEffect, useLocalSearchParams} from 'expo-router'
import React from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native'

function canCreateTeam(mini: any) {
  if (!mini) return false
  if (mini.is_admin) return true
  const permission = mini.team_create_permission || 'admins'
  if (permission === 'anyone') return true
  if (permission === 'members') return mini.member_status === 'active'
  return false
}

export default function MiniLeagueTeamsScreen() {
  const {id} = useLocalSearchParams<{id: string}>()
  const miniId = Number(id)
  const api = useMiniLeagues()
  const {colors} = useTheme()
  const [loading, setLoading] = React.useState(true)
  const [mini, setMini] = React.useState<any>(null)
  const [teams, setTeams] = React.useState<any[]>([])
  const [name, setName] = React.useState('')
  const [shortName, setShortName] = React.useState('')
  const [creating, setCreating] = React.useState(false)

  const refresh = React.useCallback(async () => {
    const [m, t] = await Promise.all([
      api.get(miniId),
      api.listTeams(miniId),
    ])
    if (m?.status === 'ok') setMini(m.data)
    if (t?.status === 'ok') setTeams(t.data || [])
  }, [api, miniId])

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true)
      refresh().finally(() => setLoading(false))
    }, [refresh]),
  )

  async function onCreate() {
    const trimmed = name.trim()
    if (!trimmed) return
    setCreating(true)
    try {
      const res = await api.createTeam(miniId, {
        name: trimmed,
        short_name: shortName.trim() || trimmed,
      })
      if (res?.status === 'ok') {
        setName('')
        setShortName('')
        await refresh()
      } else {
        Alert.alert('Error', res?.error || 'Could not create team')
      }
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    )
  }

  const allowCreate = canCreateTeam(mini)

  return (
    <ScrollView className="flex-1 px-4" style={{backgroundColor: colors.background}}>
      <Text className="font-semibold mt-4 mb-2">Teams</Text>
      {teams.length === 0 ? (
        <Text className="opacity-60 mb-4">No teams yet.</Text>
      ) : (
        teams.map(t => (
          <Text key={t.id} className="py-2 border-b border-slate-200 dark:border-slate-700">
            {t.short_name || t.name}
          </Text>
        ))
      )}

      {allowCreate ? (
        <View className="mt-6">
          <Text className="font-semibold mb-2">Create team</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Team name"
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
          <TextInput
            value={shortName}
            onChangeText={setShortName}
            placeholder="Short name (optional)"
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
          <Button onPress={onCreate} disabled={creating || !name.trim()}>
            <Text className="text-white">
              {creating ? 'Creating…' : 'Create team'}
            </Text>
          </Button>
        </View>
      ) : null}

      {mini?.is_admin ? (
        <Pressable
          className="mt-6 mb-10"
          onPress={() =>
            router.push({
              pathname: '/teams/mini-leagues/[id]/copy',
              params: {id: String(miniId)},
            })
          }>
          <Text style={{color: colors.primary, fontWeight: '600'}}>
            Copy teams from main league…
          </Text>
        </Pressable>
      ) : (
        <View className="h-10" />
      )}
    </ScrollView>
  )
}
