import React from 'react'
import {FlatList} from 'react-native'
import {
  ActivityIndicator,
  Button,
  Pressable,
  Row,
  Text,
  TextInput,
  View,
} from '@ybase'
import {TouchableRipple} from 'react-native-paper'
import {useLeague, useYBase} from '~/lib/hooks'
import {useNavigation} from '@react-navigation/native'
import {useTranslation} from 'react-i18next'
import TrieSearch from 'trie-search'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useSelector} from 'react-redux'

const PlayerCard = ({player, idx}) => {
  const {colors} = useYBase()
  const bgColor = idx % 2 ? colors.teamCard : colors.teamCardAlt
  const navigation = useNavigation()
  const {t} = useTranslation()
  const user = useSelector(_state => _state.userData).user

  function HandlePress() {
    navigation.navigate('Player', {playerInfo: player})
  }

  return (
    <TouchableRipple onPress={() => HandlePress()}>
      <View bgColor={bgColor} px={20}>
        <Row alignItems="center" justifyContent="space-between">
          <View flex={1}>
            <Text>{player.flag}</Text>
          </View>
          <View flex={2}>
            <Text bold>
              #{player.id} {player.nickname}
            </Text>
          </View>
          <View flex={4}>
            <Text>
              ({player.firstname.substring(0, 2)}...{' '}
              {player.lastname.substring(0, 3)}...)
            </Text>
          </View>
          {typeof user?.id !== 'undefined' && user.id && (
            <View flex={5}>
              <Button
                onPress={() =>
                  navigation.navigate('Request Merge', {playerInfo: player})
                }
                variant="ghost">
                {t('request_merge')}
              </Button>
            </View>
          )}
        </Row>
      </View>
    </TouchableRipple>
  )
}

const PlayersHeader = props => {
  const {t} = useTranslation()
  const {colors} = useYBase()
  return (
    <View px={20}>
      <TextInput
        placeholder={t('search')}
        value={props.searchQuery}
        onChangeText={text => props.setSearchQuery(text)}
        inputRightElement={
          <View mr={10}>
            <Pressable onPress={() => props.clearQuery()}>
              <MCI
                name="close-circle-outline"
                color={colors.onSurface}
                size={30}
              />
            </Pressable>
          </View>
        }
      />
    </View>
  )
}

const PlayersHome = props => {
  const league = useLeague()
  const [players, setPlayers] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const trie = React.useRef(new TrieSearch('nickname', {splitOnRegEx: false}))

  async function GetPlayers() {
    try {
      setIsLoading(true)
      const res = await league.GetUniquePlayers()
      setPlayers(res.data)
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    GetPlayers()
  }, [])

  React.useEffect(() => {
    if (players.length > 0) {
      trie.current.addAll(players)
    }
  }, [players])

  React.useEffect(() => {
    if (searchQuery.length > 1) {
      const list = trie.current.search(searchQuery)
      setPlayers(list)
    }
  }, [searchQuery])

  function HandleClearQuery() {
    setSearchQuery('')
    GetPlayers()
  }

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator />
      </View>
    )
  } else {
    return (
      <FlatList
        ListHeaderComponent={
          <PlayersHeader
            setSearchQuery={setSearchQuery}
            searchQuery={searchQuery}
            clearQuery={HandleClearQuery}
          />
        }
        data={players}
        keyExtractor={(item, index) => item.player_name + '_' + index}
        renderItem={({item, index}) => <PlayerCard player={item} idx={index} />}
      />
    )
  }
}

export default PlayersHome
