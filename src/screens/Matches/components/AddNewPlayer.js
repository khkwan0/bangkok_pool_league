import React from 'react'
import {Image} from 'react-native'
import {Button, Row, Text, TextInput, View} from '@ybase'
import config from '~/config'
import {useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {useLeague, useYBase} from '~/lib/hooks'
import TrieSearch from 'trie-search'

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
          onPress={() => props.handleSelect(props.player.id, false, true)}>
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
            props.handleSelect(res.data.playerId, true, true)
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

export default AddNewPlayer
