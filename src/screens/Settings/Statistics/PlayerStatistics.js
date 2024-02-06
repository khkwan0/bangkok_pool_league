import React from 'react'
import {FlatList} from 'react-native'
import {Pressable, Row, Text, TextInput, View} from '@ybase'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useLeague, useYBase} from '~/lib/hooks'
import {useSelector} from 'react-redux'
import TrieSearch from 'trie-search'
import {useTranslation} from 'react-i18next'

const PlayerListing = ({data, idx}) => {
  const user = useSelector(_state => _state.userData).user
  let textStyle = {}
  if (typeof user.id !== 'undefined' && user.id === data.playerId) {
    textStyle = {
      fontWeight: 'bold',
      fontSize: 16,
    }
  }
  return (
    <Row alignItems="center" my={5}>
      <View flex={1}>
        <Text style={textStyle}>{data.rank}</Text>
      </View>
      <View flex={2}>
        <Text style={textStyle}>{data.name}</Text>
      </View>
      <View flex={1}>
        <Text style={textStyle}>{data.played}</Text>
      </View>
      <View flex={1}>
        <Text style={textStyle}>{data.won}</Text>
      </View>
      <View flex={1}>
        <Text style={textStyle}>{data.rawPerfDisp}</Text>
      </View>
      <View flex={1}>
        <Text style={textStyle}>{data.adjPerfDisp}</Text>
      </View>
    </Row>
  )
}

const PlayerStatsHeader = props => {
  const {t} = useTranslation()
  const {colors} = useYBase()
  return (
    <View>
      <View>
        <TextInput
          value={props.searchQuery}
          onChangeText={text => props.setSearchQuery(text)}
          placeholder={t('search')}
          inputRightElement={
            <View mr={10}>
              <Pressable onPress={() => props.setSearchQuery('')}>
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
      <Row alignItems="center">
        <View flex={1}>
          <Text bold>rank</Text>
        </View>
        <View flex={2}>
          <Text bold>player</Text>
        </View>
        <View flex={1}>
          <Text bold>played</Text>
        </View>
        <View flex={1}>
          <Text bold>points</Text>
        </View>
        <View flex={1}>
          <Text bold>raw_perf</Text>
        </View>
        <View flex={1}>
          <Text bold>adj_perf</Text>
        </View>
      </Row>
    </View>
  )
}

const PlayerStatistics = props => {
  const league = useLeague()
  const [playerStats, setPlayerStats] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [list, setList] = React.useState([])
  const {colors} = useYBase()

  const trie = React.useRef(new TrieSearch('name', {splitOnRegEx: false}))

  React.useEffect(() => {
    if (playerStats.length > 0) {
      trie.current.addAll(playerStats)
    }
  }, [playerStats])

  React.useEffect(() => {
    if (searchQuery.length > 0) {
      const _list = trie.current.search(searchQuery)
      setList(_list)
    } else {
      setList(playerStats)
    }
  }, [searchQuery, playerStats])

  React.useEffect(() => {
    ;(async () => {
      try {
        setIsLoading(true)
        const res = await GetPlayerStats()
        setPlayerStats(res)
      } catch (e) {
        console.log(e)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  async function GetPlayerStats() {
    try {
      const res = await league.GetPlayerStats()
      return res
    } catch (e) {
      console.log(e)
      return []
    }
  }
  return (
    <View px={20} bgColor={colors.background} flex={1}>
      <FlatList
        ListHeaderComponent={
          <PlayerStatsHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        }
        data={list}
        renderItem={({item, index}) => (
          <PlayerListing data={item} idx={index} />
        )}
      />
    </View>
  )
}

export default PlayerStatistics
