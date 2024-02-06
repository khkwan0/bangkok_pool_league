import React from 'react'
import {ActivityIndicator, View} from '@ybase'
import TrieSearch from 'trie-search'
import {useLeague} from '~/lib/hooks'
import {FlatList} from 'react-native'
import PlayersHeader from './components/PlayersHeader'
import PlayerCard from './components/PlayerCard'

const Players = props => {
  const league = useLeague()
  const [players, setPlayers] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const trie = React.useRef(
    new TrieSearch(['nickname', 'firstname', 'lastname'], {
      splitOnRegEx: false,
    }),
  )

  async function GetPlayers() {
    try {
      setIsLoading(true)
      const res = await league.GetAllPlayers()
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
        renderItem={({item, index}) => (
          <PlayerCard player={item} idx={index} navigation={props.navigation} />
        )}
      />
    )
  }
}

export default Players
