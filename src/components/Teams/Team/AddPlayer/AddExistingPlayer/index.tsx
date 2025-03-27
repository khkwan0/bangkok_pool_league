import {FlatList, Text, View} from 'react-native'
import TrieSearch from 'trie-search'
import React from 'react'
import {useTranslation} from 'react-i18next'
import CustomTextInput from '@/components/TextInput'
import {MaterialCommunityIcons} from '@expo/vector-icons'
import {useNavigation} from '@react-navigation/native'
import PlayerCard from './playerCard'
import {useLeague} from '@/hooks'
import {router, useLocalSearchParams} from 'expo-router'

export default function AddExistingPlayer() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [list, setList] = React.useState([])
  const {t} = useTranslation()
  const navigation = useNavigation()
  const league = useLeague()
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState('')
  const {teamIdParams} = useLocalSearchParams()
  const teamId = JSON.parse(teamIdParams as string).teamId

  const trie = React.useRef(new TrieSearch('nickname', {splitOnRegEx: false}))

  async function fetchPlayers() {
    try {
      const players = await league.GetUniquePlayers()
      trie.current.addAll(players.data)
    } catch (error) {
      console.error(error)
      setErr(t('error_fetching_players'))
    } finally {
      setLoading(false)
    }
  }

  async function addPlayer(playerId: number) {
    try {
      setErr('')
      const res = await league.AddPlayerToTeam(playerId, teamId)
      if (res.status === 'ok') {
        router.dismissTo({
          pathname: '../../team',
          params: {params: JSON.stringify({teamId})},
        })
      } else if (res.status === 'error') {
        setErr(t('error_adding_player'))
      }
    } catch (error) {
      console.error(error)
    }
  }

  React.useEffect(() => {
    navigation.setOptions({
      title: t('add_existing_player'),
    })
  }, [])

  React.useEffect(() => {
    fetchPlayers()
  }, [])

  React.useEffect(() => {
    if (searchQuery.length > 0) {
      const _list = trie.current.search(searchQuery)
      setList(_list)
    } else {
      setList([])
    }
  }, [searchQuery])

  return (
    <View>
      <View className="p-5">
        <CustomTextInput
          value={searchQuery}
          disabled={loading}
          onChangeText={setSearchQuery}
          leftIcon={MaterialCommunityIcons}
          leftIconProps={{name: 'magnify'}}
          placeholder={loading ? t('loading') : t('search_player')}
        />
        {err && <Text className="text-red-500 text-center mt-2">{err}</Text>}
      </View>
      <FlatList
        data={list}
        keyExtractor={(item, index) => item.id.toString() + index}
        renderItem={({item}) => (
          <PlayerCard player={item} handlePress={addPlayer} />
        )}
      />
    </View>
  )
}
