import Button from '@/components/Button'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useLeagueContext} from '@/context/LeagueContext'
import {useMiniLeagues} from '@/hooks/useMiniLeagues'
import {validateCompetition} from '@/lib/competitionValidation'
import {
  CANONICAL_COMPETITION,
  type Competition,
} from '@/types/competition'
import {useTheme} from 'expo-router/react-navigation'
import {router} from 'expo-router'
import React from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  TextInput,
} from 'react-native'

type MiniRow = {
  id: number
  name: string
  is_admin?: boolean
  member_status?: string | null
}

export function CompetitionPickerModal() {
  const {state, setCompetition, closeCompetitionPicker, apiUrl} =
    useLeagueContext()
  const api = useMiniLeagues()
  const apiRef = React.useRef(api)
  apiRef.current = api
  const {colors} = useTheme()
  const visible = state.competitionPickerOpen
  const [items, setItems] = React.useState<MiniRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [name, setName] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const competitionRef = React.useRef(state.competition)
  competitionRef.current = state.competition

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiRef.current.list()
      if (res?.status === 'ok' && Array.isArray(res.data)) {
        setItems(res.data)
        const current = competitionRef.current
        const validated = validateCompetition(current, res.data)
        if (
          validated.type !== current.type ||
          (validated.type === 'mini' &&
            current.type === 'mini' &&
            (validated.id !== current.id || validated.name !== current.name))
        ) {
          await setCompetition(validated)
        }
      } else {
        setItems([])
        setError(
          res?.error === 'unauthorized'
            ? 'Sign in to see mini leagues'
            : res?.error || 'Could not load mini leagues',
        )
      }
    } finally {
      setLoading(false)
    }
  }, [setCompetition])

  React.useEffect(() => {
    if (visible) {
      load()
    }
  }, [visible, load, apiUrl])

  async function select(competition: Competition) {
    await setCompetition(competition)
    closeCompetitionPicker()
    router.navigate('/(tabs)/(index)' as any)
  }

  async function onCreate() {
    const trimmed = name.trim()
    if (!trimmed) return
    setCreating(true)
    setError(null)
    try {
      const res = await apiRef.current.create(trimmed)
      if (res?.status === 'ok' && res.data?.id) {
        setName('')
        await setCompetition({
          type: 'mini',
          id: Number(res.data.id),
          name: res.data.name || trimmed,
        })
        closeCompetitionPicker()
        router.push({
          pathname: '/teams/mini-leagues/[id]',
          params: {id: String(res.data.id)},
        })
      } else {
        Alert.alert('Error', res?.error || 'Could not create mini league')
      }
    } finally {
      setCreating(false)
    }
  }

  async function onRespond(id: number, action: 'accept' | 'decline') {
    const res = await apiRef.current.respondInvite(id, action)
    if (res?.status === 'ok') {
      await load()
      if (action === 'accept') {
        const row = items.find(i => i.id === id)
        await select({
          type: 'mini',
          id,
          name: row?.name || 'Mini league',
        })
      }
    } else {
      Alert.alert('Error', res?.error || 'Request failed')
    }
  }

  const activeMiniId =
    state.competition.type === 'mini' ? state.competition.id : null

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeCompetitionPicker}>
      <View className="flex-1" style={{backgroundColor: colors.background}}>
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <Text className="text-xl font-bold">Switch competition</Text>
          <Pressable onPress={closeCompetitionPicker} hitSlop={12}>
            <Text style={{color: colors.primary, fontWeight: '600'}}>Done</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => select(CANONICAL_COMPETITION)}
          className="mx-4 my-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
          style={{
            borderColor:
              state.competition.type === 'canonical'
                ? colors.primary
                : colors.border || '#8884',
            borderWidth: state.competition.type === 'canonical' ? 2 : 1,
          }}>
          <Text className="text-base font-semibold">Bangkok Pool League</Text>
          <Text className="text-sm opacity-70 mt-1">Main league</Text>
        </Pressable>

        <View className="px-4 pt-4 pb-2">
          <Text className="text-sm font-semibold opacity-70 mb-2">
            Mini leagues
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Create mini league…"
            placeholderTextColor={colors.text + '66'}
            style={{
              borderWidth: 1,
              borderColor: colors.border || '#8884',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: colors.text,
              marginBottom: 8,
            }}
          />
          <Button onPress={onCreate} disabled={creating || !name.trim()}>
            <Text className="text-white">
              {creating ? 'Creating…' : 'Create'}
            </Text>
          </Button>
          {error ? (
            <Text className="text-sm mt-2" style={{color: '#dc2626'}}>
              {error}
            </Text>
          ) : null}
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            style={{flex: 1}}
            data={items}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={{paddingBottom: 40, flexGrow: 1}}
            ListEmptyComponent={
              <Text className="text-center opacity-60 mt-6 px-4">
                {error ? '' : 'No mini leagues yet.'}
              </Text>
            }
            renderItem={({item}) => {
              const selected = activeMiniId === item.id
              const pending = item.member_status === 'pending'
              return (
                <Pressable
                  disabled={pending}
                  onPress={() =>
                    select({
                      type: 'mini',
                      id: item.id,
                      name: item.name,
                    })
                  }
                  className="mx-4 my-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
                  style={{
                    borderColor: selected
                      ? colors.primary
                      : colors.border || '#8884',
                    borderWidth: selected ? 2 : 1,
                    opacity: pending ? 0.85 : 1,
                  }}>
                  <Text className="text-base font-semibold">{item.name}</Text>
                  <Text className="text-sm opacity-70 mt-1">
                    {item.is_admin ? 'Admin' : 'Member'}
                    {pending ? ' · Invite pending' : ''}
                  </Text>
                  {pending ? (
                    <View className="flex-row gap-2 mt-3">
                      <Button onPress={() => onRespond(item.id, 'accept')}>
                        <Text className="text-white">Accept</Text>
                      </Button>
                      <Button
                        type="outline"
                        onPress={() => onRespond(item.id, 'decline')}>
                        Decline
                      </Button>
                    </View>
                  ) : null}
                </Pressable>
              )
            }}
          />
        )}
      </View>
    </Modal>
  )
}
