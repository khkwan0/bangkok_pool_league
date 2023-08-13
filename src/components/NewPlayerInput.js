import React from 'react'
import {FlatList, View} from 'react-native'
import {Button, Text, TextInput} from 'react-native-paper'
import TrieSearch from 'trie-search'
import PlayerCard from '@components/PlayerCard'
import {useLeague} from '~/lib/hooks'

const NewPlayerInput = props => {
  const [nickname, setNickname] = React.useState('')
  const [newNickname, setNewNickname] = React.useState('')
  const [newFirstName, setNewFirstName] = React.useState('')
  const [newLastName, setNewLastName] = React.useState('')
  const [newEmail, setNewEmail] = React.useState('')
  const [showAddNew, setShowAddNew] = React.useState(false)
  const [list, setList] = React.useState([])
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const league = useLeague()

  const trie = React.useRef(new TrieSearch('nickname', {splitOnRegEx: false}))

  React.useEffect(() => {
    if (props.allPlayers) {
      trie.current.addAll(props.allPlayers ?? [])
    }
  }, [props.allPlayers])

  React.useEffect(() => {
    if (nickname.length > 2) {
      const _list = trie.current.search(nickname)
      setList(_list)
    }
  }, [nickname])

  React.useEffect(() => {
    if (newNickname.length < 3) {
      setError('Nick name requires at least 3 characters')
    } else {
      setError('')
    }
  }, [newNickname])

  async function HandleAddNew() {
    if (newNickname && newNickname.length >= 3) {
      try {
        setLoading(true)
        const res = await league.SaveNewPlayer(
          newNickname,
          newFirstName,
          newLastName,
          newEmail,
          props.frameInfo.teamId,
        )
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          if (
            typeof res.data !== 'undefined' &&
            res.data.playerId !== 'undefined' &&
            res.data.playerId
          ) {
            props.handleSelect(res.data.playerId, true)
          } else {
            setError('Error Saving')
          }
        } else if (typeof res.status !== 'undefined' && res.status === 'err') {
          if (typeof res.msg !== 'undefined') {
            setError(res.msg)
          } else {
            setError('Error Saving (unknown)')
          }
        }
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <>
      {showAddNew && (
        <View style={{flex: 1, margin: 20}}>
          <View style={{flex: 1}}>
            <View style={{flex: 1}}>
              <TextInput
                placeholder="Nick name (display name)"
                value={newNickname}
                onChangeText={text => setNewNickname(text)}
              />
              <Text>* required</Text>
            </View>
            <View style={{flex: 2, rowGap: 20}}>
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
          <View style={{flex: 1, justifyContent: 'flex-end'}}>
            <View>
              <Text style={{color: '#f00', textAlign: 'center'}}>{error}</Text>
            </View>
            <View>
              <Button
                loading={loading}
                disabled={error ? true : false}
                mode="contained"
                onPress={() => HandleAddNew()}>
                Add
              </Button>
            </View>
          </View>
        </View>
      )}
      {!showAddNew && (
        <View style={{flex: 1}}>
          <View style={{flex: 1}}>
            <View style={{margin: 20}}>
              <TextInput
                placeholder="Search name..."
                value={nickname}
                onChangeText={text => setNickname(text)}
              />
            </View>
            <View style={{flex: 5}}>
              <FlatList
                keyExtractor={(item, idx) => item.nickname + idx}
                data={list}
                renderItem={({item}) => (
                  <PlayerCard
                    player={item}
                    showFirstLast
                    onlyLastInitial
                    frameInfo={props.frameInfo}
                  />
                )}
              />
            </View>
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Button onPress={() => setShowAddNew(true)}>
                Add New Player
              </Button>
            </View>
          </View>
        </View>
      )}
    </>
  )
}

export default NewPlayerInput
