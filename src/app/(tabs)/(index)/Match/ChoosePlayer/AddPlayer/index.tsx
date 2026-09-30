import React from 'react'
import {
  FlatList,
  Pressable,
  useColorScheme,
  View,
} from 'react-native'
import {ThemedView} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import Button from '@/components/Button'
import TrieSearch from 'trie-search'
import PlayerCard from '@/components/PlayerCard'
import CustomTextInput from '@/components/TextInput'
import {useLeague, useTeams} from '@/hooks'
import {useTranslation} from 'react-i18next'
import {MaterialCommunityIcons} from '@expo/vector-icons'
import {useNavigation} from 'expo-router/react-navigation'
import {router, useLocalSearchParams} from 'expo-router'
import {useThemeColor} from '@/hooks/useThemeColor'
import {useMatchContext} from '@/context/MatchContext'

type PlayerHit = {
  id: number
  nickname: string
  firstname?: string
  lastname?: string
  profile_picture?: string
  id_str: string
}

const AddNewPlayer = ({
  handleSelect,
  setShowAddNewPlayer,
  showAddNewPlayer,
}: {
  handleSelect: (playerId: number, nickname: string, newplayer: boolean) => void
  setShowAddNewPlayer: (show: boolean) => void
  showAddNewPlayer: boolean
}) => {
  const [nickname, setNickname] = React.useState('')
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState('')
  const {t} = useTranslation()
  const league = useLeague()
  const colorScheme = useColorScheme()

  async function HandleSave() {
    try {
      setErr('')
      if (nickname && nickname.length > 1) {
        setLoading(true)
        const res = await league.SaveNewPlayer(
          nickname,
          firstName,
          lastName,
          email,
        )
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          if (
            typeof res.data !== 'undefined' &&
            typeof res.data.playerId !== 'undefined' &&
            res.data.playerId
          ) {
            handleSelect(res.data.playerId, nickname, true)
          } else {
            setErr('Error Saving')
          }
        } else if (typeof res.status !== 'undefined' && res.status === 'err') {
          if (typeof res.msg !== 'undefined') {
            setErr(res.msg)
          } else {
            setErr('Error Saving (unknown)')
          }
        }
      } else {
        setErr('too_short')
      }
    } catch (e) {
      console.log(e)
      setErr('server_error')
    } finally {
      setLoading(false)
    }
  }

  function HandleClear() {
    setErr('')
    setNickname('')
    setFirstName('')
    setLastName('')
    setEmail('')
    setShowAddNewPlayer(false)
  }

  if (!showAddNewPlayer) {
    return (
      <View className="px-4 pb-8">
        <Pressable
          onPress={() => setShowAddNewPlayer(true)}
          className="flex-row items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 active:bg-blue-700">
          <MaterialCommunityIcons name="account-plus" size={22} color="#fff" />
          <Text className="text-white text-center font-semibold">
            add_new_player
          </Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View className="px-4 pb-10">
      <View className="mb-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 p-4">
        <Text type="subtitle" className="mb-4">
          add_new_player
        </Text>

        <View className="mb-3">
          <Text className="mb-1.5 text-sm opacity-80">nickname_required</Text>
          <CustomTextInput
            onChangeText={setNickname}
            autoCapitalize="none"
            leftIcon={MaterialCommunityIcons}
            leftIconProps={{name: 'account-outline'}}
            iconSize={22}
            value={nickname}
            placeholder={t('nickname')}
            placeholderTextColor={colorScheme === 'dark' ? '#999' : '#333'}
          />
        </View>

        <View className="mb-3">
          <Text className="mb-1.5 text-sm opacity-80">first_name_label</Text>
          <CustomTextInput
            onChangeText={setFirstName}
            autoCapitalize="words"
            leftIcon={MaterialCommunityIcons}
            leftIconProps={{name: 'card-account-details-outline'}}
            iconSize={22}
            value={firstName}
            placeholder={t('first_name')}
            placeholderTextColor={colorScheme === 'dark' ? '#999' : '#333'}
          />
        </View>

        <View className="mb-3">
          <Text className="mb-1.5 text-sm opacity-80">last_name_label</Text>
          <CustomTextInput
            onChangeText={setLastName}
            autoCapitalize="words"
            leftIcon={MaterialCommunityIcons}
            leftIconProps={{name: 'card-account-details-outline'}}
            iconSize={22}
            value={lastName}
            placeholder={t('last_name')}
            placeholderTextColor={colorScheme === 'dark' ? '#999' : '#333'}
          />
        </View>

        <View className="mb-2">
          <Text className="mb-1.5 text-sm opacity-80">email_optional</Text>
          <CustomTextInput
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={MaterialCommunityIcons}
            leftIconProps={{name: 'email-outline'}}
            iconSize={22}
            value={email}
            placeholder={t('email_placeholder')}
            placeholderTextColor={colorScheme === 'dark' ? '#999' : '#333'}
          />
        </View>

        {!!err && (
          <Text
            className="text-center mb-3"
            type="defaultSemiBold"
            style={{color: '#ef4444'}}>
            {err}
          </Text>
        )}

        <View className="flex-row gap-3 mt-2">
          <View className="flex-1">
            <Button type="outline" onPress={HandleClear} disabled={loading}>
              cancel
            </Button>
          </View>
          <View className="flex-1">
            <Button onPress={HandleSave} disabled={loading}>
              save
            </Button>
          </View>
        </View>
      </View>
    </View>
  )
}

const AddPlayer = () => {
  const {t} = useTranslation()
  const [showAddNewPlayer, setShowAddNewPlayer] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<PlayerHit[]>([])
  const league = useLeague()
  const teams = useTeams()
  const navigation = useNavigation()
  const [query, setQuery] = React.useState('')
  const {state, UpdateFramePlayers}: any = useMatchContext()
  const bgColor = useThemeColor({}, 'background')
  const {params} = useLocalSearchParams()

  const {frameIndex, slot, side, frameNumber, frameType} = JSON.parse(
    params as string,
  )

  const trie = React.useRef(
    new TrieSearch(['nickname', 'firstname', 'lastname', 'id_str'], {
      splitOnRegEx: false,
    }),
  )

  React.useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const res = await league.GetUniquePlayers()
        const indexed = (res.data ?? []).map((player: PlayerHit) => ({
          ...player,
          id_str: String(player.id),
        }))
        trie.current.addAll(indexed)
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  React.useEffect(() => {
    if (query.trim().length > 0) {
      setData(trie.current.search(query.trim()) as PlayerHit[])
    } else {
      setData([])
    }
  }, [query])

  React.useEffect(() => {
    navigation.setOptions({title: t('add_new_player')})
  }, [])

  async function HandleSelect(
    playerId = 0,
    nickname = '',
    newplayer = false,
  ) {
    try {
      await teams.AddExistingPlayerToTeam(
        side === 'home'
          ? state.matchInfo.home_team_id
          : state.matchInfo.away_team_id,
        playerId,
      )
      UpdateFramePlayers(
        frameIndex,
        side,
        slot,
        playerId,
        nickname,
        newplayer,
        frameType,
        frameNumber,
      )
      router.dismissTo('/Match')
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <ThemedView className="flex-1" style={{backgroundColor: bgColor}}>
      <FlatList
        className="flex-1"
        contentContainerStyle={{paddingBottom: 24}}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          !showAddNewPlayer ? (
            <View className="px-4 pt-5 pb-2">
              <View className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 p-4 mb-4">
                <View className="flex-row items-center gap-2 mb-1">
                  <MaterialCommunityIcons
                    name="account-search"
                    size={22}
                    color="#3b82f6"
                  />
                  <Text type="defaultSemiBold">add_existing_player</Text>
                </View>
                <Text className="mb-3 opacity-70 text-sm">
                  search_player
                </Text>
                <CustomTextInput
                  value={query}
                  disabled={loading}
                  onChangeText={setQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="default"
                  leftIcon={MaterialCommunityIcons}
                  leftIconProps={{name: 'magnify'}}
                  rightIcon={
                    query.length > 0 ? MaterialCommunityIcons : undefined
                  }
                  rightIconProps={
                    query.length > 0 ? {name: 'close-circle'} : undefined
                  }
                  onRightIconPress={
                    query.length > 0 ? () => setQuery('') : undefined
                  }
                  placeholder={loading ? t('loading') : t('search_player')}
                />
                {query.trim().length > 0 && data.length === 0 && !loading && (
                  <Text className="text-center mt-3 opacity-60">
                    no_players_found
                  </Text>
                )}
              </View>

              <View className="flex-row items-center gap-3 mb-4 px-2">
                <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
                <Text className="opacity-50 text-xs uppercase tracking-widest">
                  or
                </Text>
                <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
              </View>
            </View>
          ) : null
        }
        data={showAddNewPlayer ? [] : data}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({item, index}) => (
          <View className="px-2">
            <PlayerCard
              player={item}
              slot={slot}
              side={side as string}
              frameIndex={frameIndex}
              frameNumber={frameNumber}
              frameType={frameType as string}
              disabled={false}
              isExisting={true}
              mfpp={1}
              accentIndex={index}
            />
          </View>
        )}
        ListFooterComponent={
          <AddNewPlayer
            setShowAddNewPlayer={setShowAddNewPlayer}
            showAddNewPlayer={showAddNewPlayer}
            handleSelect={HandleSelect}
          />
        }
      />
    </ThemedView>
  )
}

export default AddPlayer
