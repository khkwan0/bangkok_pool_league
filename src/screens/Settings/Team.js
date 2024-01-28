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
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'

const PlayerCard = props => {
  const {t} = useTranslation()
  const user = useSelector(_state => _state.userData).user

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
                    user.role_id === 9
                      ? props.player.lastname.length
                      : (props.player.firstname ?? props.player.firstName)
                          .length > 2
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
                    user.role_id === 9
                      ? props.player.lastname.length
                      : (props.player.lastname ?? props.player.lastName)
                          .length > 2
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
    if (searchQuery.length > 1) {
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
  const [showAddNewPlayer, setShowAddNewPlayer] = React.useState(false)
  const [newNickName, setNewNickName] = React.useState('')
  const [newFirstName, setNewFirstName] = React.useState('')
  const [newLastName, setNewLastName] = React.useState('')
  const [newEmail, setNewEmail] = React.useState('')
  const [valid, setValid] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState('')
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

  async function HandleSave() {
    try {
      if (newNickName && newNickName.length > 1) {
        setLoading(true)
        const res = await league.SaveNewPlayer(
          newNickName,
          newFirstName,
          newLastName,
          newEmail,
        )
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          if (
            typeof res.data !== 'undefined' &&
            res.data.playerId !== 'undefined' &&
            res.data.playerId
          ) {
            props.handleSelect(res.data.playerId)
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

  React.useEffect(() => {
    if (newNickName.length > 1) {
      setValid(true)
    }
  }, [newNickName])

  return (
    <View>
      <View mt={20}>
        <Text bold>add_player</Text>
      </View>
      <ChoosePlayer allPlayers={allPlayers} handleSelect={props.handleSelect} />
      <Row alignItems="center" space={20} my={20}>
        <View flex={1}>
          {!showAddNewPlayer && (
            <View>
              <View>
                <Text textAlign="center" bold fontSize="xxxl">
                  - OR -
                </Text>
              </View>
              <View mt={10}>
                <Button onPress={() => setShowAddNewPlayer(true)}>
                  {t('add_new_player')}
                </Button>
              </View>
            </View>
          )}
          {showAddNewPlayer && (
            <View>
              <View>
                <Text textAlign="center" bold fontSize="xxxl">
                  - OR -
                </Text>
              </View>
              <View>
                <Text bold>add_new_player</Text>
              </View>
              <View>
                <View>
                  <TextInput
                    placeholder={
                      t('nickname') + ' ' + '(' + t('required') + ')'
                    }
                    value={newNickName}
                    onChangeText={text => setNewNickName(text)}
                  />
                </View>
                <View>
                  <TextInput
                    placeholder="Email (recommended)"
                    value={newEmail}
                    onChangeText={text => setNewEmail(text)}
                  />
                </View>
                <View>
                  <TextInput
                    placeholder="First Name (optional)"
                    value={newFirstName}
                    onChangeText={text => setNewFirstName(text)}
                  />
                </View>
                <View>
                  <TextInput
                    placeholder="Last Name (optional)"
                    value={newLastName}
                    onChangeText={text => setNewLastName(text)}
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </Row>
      <View flex={1}>
        {err && (
          <View>
            <Text textAlign="center" color={colors.error}>
              {err}
            </Text>
          </View>
        )}
        <Row space={10}>
          <View flex={1}>
            <Button onPress={() => props.cancel()} variant="outline">
              {t('cancel')}
            </Button>
          </View>
          <View flex={1}>
            <Button
              loading={loading}
              disabled={!valid}
              onPress={() => HandleSave()}>
              {t('save')}
            </Button>
          </View>
        </Row>
      </View>
    </View>
  )
}

const Team = props => {
  const [team, setTeam] = React.useState([])
  const navigation = useNavigation()
  const user = useSelector(_state => _state.userData).user
  const [showAddNewPlayer, setShowAddNewPlayer] = React.useState(false)
  const [toDelete, setToDelete] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const {t} = useTranslation()
  const {colors} = useYBase()
  const [canAdd, setCanAdd] = React.useState(false)
  const [err, setErr] = React.useState('')
  const league = useLeague()

  const captains = React.useMemo(() => {
    if (typeof team.captains !== 'undefined') {
      return team.captains.map(u => u.id)
    } else {
      return []
    }
  }, [team])

  const assts = React.useMemo(() => {
    if (typeof team.assistants !== 'undefined') {
      return team.assistants.map(u => u.id)
    } else {
      return []
    }
  }, [team])

  React.useEffect(() => {
    setCanAdd(
      captains.includes(user.id) ||
        assts.includes(user.id) ||
        user.role_id === 9,
    )
  }, [captains, assts])

  async function RefreshTeam() {
    try {
      const res = await league.GetTeamInfo(props.team.id)
      setTeam(res)
    } catch (e) {
      console.log(e)
      setErr('server_error')
    }
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      RefreshTeam()
    })
    return unsubscribe
  }, [navigation])

  async function HandleSelect(playerId) {
    try {
      setShowAddNewPlayer(false)
      const res = await league.AddPlayerToTeam(playerId, team.id)
      console.log(res, team.id)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        console.log('refreshing')
        RefreshTeam()
      } else {
        setErr(res.error)
      }
    } catch (e) {
      console.log(e)
      setErr('server_error')
    }
  }

  async function HandleDelete() {
    try {
      setLoading(true)
      setErr('')
      const res = await league.RemovePlayerFromTeam(toDelete, team.id)
      if (typeof res.error !== 'undefined' && res.error) {
        setErr(res.error)
      }
      setToDelete(0)
      RefreshTeam()
    } catch (e) {
      console.log(e)
      setErr('server_error')
    } finally {
      setLoading(false)
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
          <Button variant="outline" onPress={() => setShowAddNewPlayer(true)}>
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
        <TwoColumns label={t('team_id')}>
          <Text bold fontSize="lg">
            #{team.id}
          </Text>
        </TwoColumns>
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
          teamId={team.id}
        />
      )}
      {!showAddNewPlayer && (
        <>
          <View mt={20}>
            {typeof team.captains !== 'undefined' &&
              team.captains.map((captain, idx) => (
                <TwoColumns
                  key={'captain' + idx}
                  label={idx === 0 ? t('captain') : ''}>
                  <Pressable
                    py={5}
                    onPress={() =>
                      navigation.navigate('Player', {
                        playerId: captain.id,
                      })
                    }>
                    <Row flex={1} alignItems="center">
                      <View flex={1}>
                        <Text fontSize="lg">
                          {captain.flag} {captain.nickname}
                        </Text>
                        {user.role_id === 9 && (
                          <Text fontSize="lg">
                            ({captain.firstname} {captain.lastname})
                          </Text>
                        )}
                      </View>
                      <View flex={1} alignItems="flex-end">
                        <MCI
                          name="chevron-right"
                          color={colors.onSurface}
                          size={30}
                        />
                      </View>
                    </Row>
                  </Pressable>
                </TwoColumns>
              ))}
            {typeof team.assistants !== 'undefined' &&
              team.assistants.map((assistant, idx) => (
                <TwoColumns
                  key={'assistant' + idx}
                  label={idx === 0 ? t('assistants') : ''}>
                  <Pressable
                    py={5}
                    onPress={() =>
                      navigation.navigate('Player', {
                        playerId: assistant.id,
                      })
                    }>
                    <Row alignItems="center" flex={1}>
                      <View flex={4}>
                        <Text fontSize="lg">
                          {assistant.flag} {assistant.nickname}
                        </Text>
                        {user.role_id === 9 && (
                          <Text fontSize="lg">
                            ({assistant.firstname} {assistant.lastname})
                          </Text>
                        )}
                      </View>
                      <View flex={1} alignItems="flex-end">
                        <MCI
                          name="chevron-right"
                          color={colors.onSurface}
                          size={30}
                        />
                      </View>
                    </Row>
                  </Pressable>
                </TwoColumns>
              ))}
          </View>
          <View style={{marginTop: 20}}>
            <View>
              <Text>players</Text>
            </View>
            {typeof team.players !== 'undefined' &&
              team.players.map((player, idx) => (
                <Row alignItems="center" key={'player' + idx} my={5}>
                  <View flex={1}>
                    <Text>{player.flag}</Text>
                  </View>
                  <View flex={5} mr={10}>
                    <Pressable
                      bgColor={colors.pressableUnpressed}
                      py={10}
                      px={10}
                      onPress={() =>
                        navigation.navigate('Player', {
                          playerId: player.id,
                        })
                      }>
                      <Text variant="bodyLarge">{player.nickname}</Text>
                      {user.role_id === 9 && (
                        <Text variant="bodyLarge">
                          ({player.firstname} {player.lastname})
                        </Text>
                      )}
                    </Pressable>
                  </View>
                  {toDelete === player.id && (
                    <View flex={5}>
                      <Row space={10}>
                        <Button
                          loading={loading}
                          onPress={() => HandleDelete()}>
                          {t('confirm')}
                        </Button>
                        <Button
                          loading={loading}
                          variant="outline"
                          onPress={() => setToDelete(0)}>
                          {t('cancel')}
                        </Button>
                      </Row>
                    </View>
                  )}
                  {toDelete !== player.id && canAdd && (
                    <View flex={1}>
                      <Pressable
                        disabled={loading}
                        onPress={() => setToDelete(player.id)}>
                        <MCI
                          name="trash-can-outline"
                          size={20}
                          color={colors.onSurface}
                        />
                      </Pressable>
                    </View>
                  )}
                </Row>
              ))}
          </View>
        </>
      )}
    </ScrollView>
  )
}

export default Team
