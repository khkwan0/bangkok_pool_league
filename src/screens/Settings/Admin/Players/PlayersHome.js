import React from 'react'
import {ActivityIndicator, View} from '@ybase'
import TrieSearch from 'trie-search'
import {useLeague} from '~/lib/hooks'
import {FlatList} from 'react-native'
import PlayersHeader from './components/PlayersHeader'
import PlayerCard from './components/PlayerCard'

const Players = props => {
  const league = useLeague()
  const [toShow, setToShow] = React.useState([])
  const [players, setPlayers] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const trie = React.useRef(
    new TrieSearch(['nickname', 'firstname', 'lastname', 'player_id'], {
      splitOnRegEx: false,
    }),
  )

  async function GetPlayers() {
    try {
      setIsLoading(true)
      const res = await league.GetAllPlayers()
      setPlayers(res.data)
      trie.current.addAll(res.data)
      setToShow(res.data)
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
    if (searchQuery.length > 1) {
      const list = trie.current.search(searchQuery)
      setToShow(list)
    } else if (searchQuery.length === 0) {
      HandleClearQuery()
    }
  }, [searchQuery])

  function HandleClearQuery() {
    setSearchQuery('')
    setToShow(players)
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
        data={toShow}
        keyExtractor={(item, index) => item.player_name + '_' + index}
        renderItem={({item, index}) => (
          <PlayerCard player={item} idx={index} navigation={props.navigation} />
        )}
      />
    )
  }
}

export default Players
