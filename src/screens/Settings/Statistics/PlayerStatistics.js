import React from 'react'
import {FlatList} from 'react-native'
import {ActivityIndicator, Pressable, Row, Text, TextInput, View} from '@ybase'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useLeague, useYBase} from '~/lib/hooks'
import {useSelector} from 'react-redux'
import TrieSearch from 'trie-search'
import {useTranslation} from 'react-i18next'
import {RadioButton} from 'react-native-paper'

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
    <>
      <View mt={20}>
        <RadioButton.Group
          onValueChange={value => props.setGameVariety(value)}
          value={props.gameVariety}>
          <Row alignItems="center">
            <Row flex={1} alignItems="center">
              <Text>All</Text>
              <RadioButton value="all" />
            </Row>
            <Row flex={1} alignItems="center">
              <Text>Singles</Text>
              <RadioButton value="singles" />
            </Row>
            <Row flex={1} alignItems="center">
              <Text>Doubles</Text>
              <RadioButton value="doubles" />
            </Row>
          </Row>
        </RadioButton.Group>
      </View>
      <View mt={20}>
        <Row alignItems="center" flexWrap="wrap">
          <Text>Show only players with at least </Text>
          <TextInput
            style={{width: 60}}
            value={props.minimumGames}
            onChangeText={text => props.setMinimumGames(text)}
            keyboardType="numeric"
          />
          <Text>
           &nbsp;games
          </Text>
        </Row>
      </View>
      <View mt={20}>
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
    </>
  )
}

const PlayerStatistics = props => {
  const league = useLeague()
  const [playerStats, setPlayerStats] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [list, setList] = React.useState([])
  const {colors} = useYBase()
  const [minimumGames, setMinimumGames] = React.useState('20')
  const [gameVariety, setGameVariety] = React.useState('all')

  const trie = React.useRef(null)

  React.useEffect(() => {
    if (isLoading) {
      ;(async () => {
        const res = await GetPlayerStats()
        setPlayerStats(res)
      })()
    }
  }, [isLoading])

  React.useEffect(() => {
    setIsLoading(false)
  }, [playerStats])

  React.useEffect(() => {
    if (playerStats.length > 0) {
      trie.current = new TrieSearch('name', {splitOnRegEx: false})
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
    if (gameVariety === 'all') {
      setMinimumGames('20')
    } else {
      setMinimumGames('8')
    }
  }, [gameVariety])

  React.useEffect(() => {
    setIsLoading(true)
  }, [minimumGames, gameVariety])

  async function GetPlayerStats() {
    try {
      const res = await league.GetPlayerStats(
        null,
        minimumGames,
        props?.route?.params?.gameType ?? '',
        gameVariety,
      )
      return res
    } catch (e) {
      console.log(e)
      return []
    }
  }

  return (
    <View px={20} bgColor={colors.background} flex={1}>
      <PlayerStatsHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        gameVariety={gameVariety}
        setGameVariety={setGameVariety}
        minimumGames={minimumGames}
        setMinimumGames={setMinimumGames}
      />
      {!isLoading && (
        <FlatList
          data={list}
          renderItem={({item, index}) => (
            <PlayerListing data={item} idx={index} />
          )}
        />
      )}
      {isLoading && <ActivityIndicator />}
    </View>
  )
}

export default PlayerStatistics
