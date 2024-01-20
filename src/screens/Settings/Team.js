import React from 'react'
import {Image} from 'react-native'
import {Button, Pressable, Row, ScrollView, Text, TextInput, View} from '@ybase'
import TwoColumns from '~/components/TwoColumns'
import {useNavigation} from '@react-navigation/native'
import config from '~/config'
import {useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {useLeague, useYBase} from '~/lib/hooks'
import TrieSearch from 'trie-search'

const PlayerCard = props => {
  const {t} = useTranslation()

  return (
    <Row alignItems="center" p={10}>
      <View flex={1.5}>
        <Text variant="bodyLarge">
          {t('nickname')}: {props.player.name ?? props.player.nickname}
        </Text>
        <Row>
          {(props.player.firstname || props.player.firstName) && (
            <Text variant="bodyLarge">
              &nbsp;
              {props.abbrevFirst
                ? (props.player.firstname ?? props.player.firstName).substr(
                    0,
                    (props.player.firstname ?? props.player.firstName).length >
                      2
                      ? 3
                      : 2,
                  )
                : props.player.firstname}
            </Text>
          )}
          {(props.player.lastname || props.player.lastName) && (
            <Text variant="bodyLarge">
              &nbsp;
              {props.abbrevLast
                ? (props.player.lastname ?? props.player.lastName).substr(
                    0,
                    (props.player.lastname ?? props.player.lastName).length > 2
                      ? 3
                      : 2,
                  )
                : props.player.lastname}
            </Text>
          )}
        </Row>
        <Text>#{props.player.id}</Text>
      </View>
      <View flex={1}>
        {props.player.profile_picture && (
          <View>
            <Image
              source={{uri: config.profileUrl + props.player.profile_picture}}
              width={40}
              height={40}
              resizeMode="contain"
              style={{borderRadius: 50}}
            />
          </View>
        )}
      </View>
      <View flex={1}>
        <Button
          disabled={props.disabled}
          variant="outline"
          onPress={() => props.handleSelect(props.player.id)}>
          Select
        </Button>
      </View>
    </Row>
  )
}

const ChoosePlayer = props => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [list, setList] = React.useState([])
  const {t} = useTranslation()

  const trie = React.useRef(new TrieSearch('nickname', {splitOnRegEx: false}))

  React.useEffect(() => {
    if (props.allPlayers) {
      trie.current.addAll(props.allPlayers ?? [])
    }
  }, [props.allPlayers])

  React.useEffect(() => {
    if (searchQuery.length > 2) {
      const _list = trie.current.search(searchQuery)
      setList(_list)
    }
  }, [searchQuery])

  return (
    <View>
      <View>
        <TextInput
          disabled={
            typeof props.allPlayer === 'undefined' ||
            props.allPlayers?.length === 0
          }
          placeholder={
            typeof props.allPlayers === 'undefined'
              ? t('loading')
              : props.allPlayers.length === 0
              ? t('loading')
              : t('search_name')
          }
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
        />
      </View>
      <View>
        {list.map((item, idx) => (
          <PlayerCard
            key={'adduser' + idx}
            abbrevLast
            handleSelect={props.handleSelect}
            player={item}
          />
        ))}
      </View>
    </View>
  )
}

const AddNewPlayer = props => {
  const {t} = useTranslation()
  const [allPlayers, setAllPlayers] = React.useState([])
  const {colors} = useYBase()
  const league = useLeague()

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await league.GetUniquePlayers()
        setAllPlayers(res.data)
      } catch (e) {
        console.log(e)
      }
    })()
  }, [])

  return (
    <View>
      <ChoosePlayer allPlayers={allPlayers} handleSelect={props.handleSelect} />
      <Row alignItems="center" space={20} my={20}>
        <View flex={1}>
          <Button onPress={() => props.cancel()} variant="outline">
            {t('cancel')}
          </Button>
        </View>
      </Row>
    </View>
  )
}

const Team = props => {
  const [team, setTeam] = React.useState(props.team)
  const navigation = useNavigation()
  const user = useSelector(_state => _state.userData).user
  const [showAddNewPlayer, setShowAddNewPlayer] = React.useState(false)
  const {t} = useTranslation()
  const {colors} = useYBase()
  const [canAdd, setCanAdd] = React.useState(false)
  const [err, setErr] = React.useState('')
  const league = useLeague()

  const captains = React.useMemo(() => {
    return team.captains.map(u => u.id)
  }, [team])

  const assts = React.useMemo(() => {
    return team.assistants.map(u => u.id)
  }, [team])

  React.useEffect(() => {
    setCanAdd(
      captains.includes(user.id) ||
        assts.includes(user.id) ||
        user.role_id === 9,
    )
  }, [])

  async function RefreshTeam() {
    try {
      const res = await league.GetTeamInfo(team.id)
      setTeam(res)
    } catch (e) {
      console.log(e)
      setErr('server_error')
    }
  }
  async function HandleSelect(playerId) {
    try {
      setShowAddNewPlayer(false)
      const res = await league.AddPlayerToTeam(playerId, team.id)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        RefreshTeam()
      } else {
        setErr(res.error)
      }
    } catch (e) {
      console.log(e)
      setErr('server_error')
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingBottom: 30,
        flexGrow: 1,
      }}>
      <View style={{alignItems: 'center'}}>
        <Image
          source={{uri: config.logoUrl + team.venue_logo}}
          width={100}
          height={100}
          resizeMode="contain"
        />
      </View>
      {canAdd && !showAddNewPlayer && (
        <View mt={20}>
          <Button variant="ghost" onPress={() => setShowAddNewPlayer(true)}>
            {t('add_player')}
          </Button>
          {err && (
            <View mt={20}>
              <Text textAlign="center" color={colors.error}>
                {err}
              </Text>
            </View>
          )}
        </View>
      )}
      <View style={{marginTop: 20}}>
        <TwoColumns label={t('name')}>
          <Text fontSize="lg" bold>
            {team.name}
          </Text>
        </TwoColumns>
      </View>
      {showAddNewPlayer && (
        <AddNewPlayer
          cancel={() => setShowAddNewPlayer(false)}
          handleSelect={HandleSelect}
        />
      )}
      {!showAddNewPlayer && (
        <>
          <View mt={20}>
            {team.captains.map((captain, idx) => (
              <TwoColumns
                key={'captain' + idx}
                label={idx === 0 ? t('captain') : ''}>
                <Pressable
                  onPress={() =>
                    navigation.navigate('Player', {
                      playerId: captain.id,
                    })
                  }>
                  <View style={{flexDirection: 'row', gap: 5}}>
                    <Text>{captain.flag}</Text>
                    <Text variant="bodyLarge">{captain.nickname}</Text>
                    <Text variant="bodyLarge">
                      ({captain.firstname} {captain.lastname})
                    </Text>
                  </View>
                </Pressable>
              </TwoColumns>
            ))}
            {team.assistants.map((assistant, idx) => (
              <TwoColumns
                key={'assistant' + idx}
                label={idx === 0 ? t('assistants') : ''}>
                <Pressable
                  onPress={() =>
                    navigation.navigate('Player', {
                      playerId: assistant.id,
                    })
                  }>
                  <View style={{flexDirection: 'row', gap: 5}}>
                    <Text>{assistant.flag}</Text>
                    <Text variant="bodyLarge">{assistant.nickname}</Text>
                    <Text variant="bodyLarge">
                      ({assistant.firstname} {assistant.lastname})
                    </Text>
                  </View>
                </Pressable>
              </TwoColumns>
            ))}
          </View>
          <View style={{marginTop: 20}}>
            <Row>
              <View flex={1}>
                <Text>players</Text>
              </View>
              <View flex={4}>
                {team.players.map((player, idx) => (
                  <Pressable
                    py={5}
                    key={'player_' + idx}
                    onPress={() =>
                      navigation.navigate('Player', {
                        playerId: player.id,
                      })
                    }>
                    <View style={{flexDirection: 'row', gap: 5}}>
                      <Text>{player.flag}</Text>
                      <Text variant="bodyLarge">{player.nickname}</Text>
                      {user.role_id === 9 && (
                        <Text variant="bodyLarge">
                          ({player.firstname} {player.lastname})
                        </Text>
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            </Row>
          </View>
        </>
      )}
    </ScrollView>
  )
}

export default Team
