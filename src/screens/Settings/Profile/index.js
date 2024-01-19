import React from 'react'
import {Button, Pressable, Row, Text, TextInput, View} from '@ybase'
import {useAccount, useYBase} from '~/lib/hooks'
import {useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {Image} from 'react-native'
import config from '~/config'

const Profile = props => {
  const {colors} = useYBase()
  const {t} = useTranslation()
  const user = useSelector(_state => _state.userData).user
  const [nickname, setNickname] = React.useState(user.nickname)
  const [firstName, setFirstName] = React.useState(user.firstname)
  const [lastName, setLastName] = React.useState(user.lastname)
  const [editLastName, setEditLastName] = React.useState(false)
  const [editFirstName, setEditFirstName] = React.useState(false)
  const [editNickname, setEditNickname] = React.useState(false)
  const account = useAccount()

  console.log(JSON.stringify(user, null, 2))

  React.useEffect(() => {
    props.navigation.setOptions({
      headerTitle: user.nickname ?? t('profile'),
    })
  }, [])

  async function HandleSaveLastName() {
    setEditLastName(false)
  }

  async function HandleSaveFirstName() {
    setEditFirstName(false)
  }

  async function HandleSaveNickName() {
    setEditNickname(false)
  }

  return (
    <View flex={1} bgColor={colors.background} px={20}>
      <View my={20} alignItems="center">
        <Image
          source={{uri: config.profileUrl + user.profile_picture}}
          width={80}
          height={80}
          resizeMode="contain"
          style={{borderRadius: 50}}
        />
      </View>
      <View py={10}>
        <Row alignItems="center">
          <View flex={1}>
            <Text bold fontSize="xl">
              main_player_id
            </Text>
          </View>
          <View flex={1} alignItems="flex-end">
            <Text fontSize="xl">{user.id}</Text>
          </View>
        </Row>
      </View>
      {typeof user.altIds !== 'undefined' && user.altIds.length > 0 && (
        <View py={10}>
          <Row>
            <View flex={1}>
              <Text bold fontSize="xl">
                associated_player_id
              </Text>
            </View>
            <View flex={1} alignItems="flex-end">
              {user.altIds.map(id => (
                <Text fontSize="xl" key={'pid' + id.id}>
                  {id.id}
                </Text>
              ))}
            </View>
          </Row>
        </View>
      )}
      <Pressable onPress={() => setEditNickname(true)}>
        <Row alignItems="center" py={10} space={10}>
          <View flex={1}>
            <Text bold fontSize="xl">
              nickname
            </Text>
          </View>
          <View flex={2} alignItems="flex-end">
            {editNickname && (
              <>
                <TextInput
                  value={nickname}
                  onChangeText={text => setNickname(text)}
                />
                <Row alignItems="center" space={20} my={10}>
                  <Button
                    variant="outline"
                    onPress={() => setEditNickname(false)}>
                    {t('cancel')}
                  </Button>
                  <Button onPress={() => HandleSaveNickName()}>
                    {t('save')}
                  </Button>
                </Row>
              </>
            )}
            {!editNickname && <Text fontSize="xl">{nickname ?? ''}</Text>}
          </View>
        </Row>
      </Pressable>
      <Pressable onPress={() => setEditFirstName(true)}>
        <Row alignItems="center" py={10} space={10}>
          <View flex={1}>
            <Text bold fontSize="xl">
              first_name
            </Text>
          </View>
          <View flex={2} alignItems="flex-end">
            {editFirstName && (
              <>
                <TextInput
                  value={firstName}
                  onChangeText={text => setFirstName(text)}
                />
                <Row alignItems="center" space={20} my={10}>
                  <Button
                    variant="outline"
                    onPress={() => setEditFirstName(false)}>
                    {t('cancel')}
                  </Button>
                  <Button onPress={() => HandleSaveFirstName()}>
                    {t('save')}
                  </Button>
                </Row>
              </>
            )}
            {!editFirstName && <Text fontSize="xl">{firstName ?? ''}</Text>}
          </View>
        </Row>
      </Pressable>
      <Pressable onPress={() => setEditLastName(true)}>
        <Row alignItems="center" py={10} space={10}>
          <View flex={1}>
            <Text bold fontSize="xl">
              last_name
            </Text>
          </View>
          <View flex={2} alignItems="flex-end">
            {editLastName && (
              <>
                <TextInput
                  value={lastName}
                  onChangeText={text => setLastName(text)}
                />
                <Row alignItems="center" space={20} my={10}>
                  <Button
                    variant="outline"
                    onPress={() => setEditLastName(false)}>
                    {t('cancel')}
                  </Button>
                  <Button onPress={() => HandleSaveLastName()}>
                    {t('save')}
                  </Button>
                </Row>
              </>
            )}
            {!editLastName && <Text fontSize="xl">{lastName ?? ''}</Text>}
          </View>
        </Row>
        <Row>
          <View flex={1}>
            <Text bold fontSize="xl">
              teams
            </Text>
          </View>
          <View flex={2} alignItems="flex-end">
            {typeof user.teams !== 'undefined' &&
              user.teams &&
              Array.isArray(user.teams) &&
              user.teams.length > 0 &&
              user.teams.map(team => (
                <Text>
                  {team.name}{' '}
                  {team.team_role_id === 2 ? '(' + t('captain') + ')' : ''}
                  {team.team_role_id === 1 ? '(' + t('asst_captain') + ')' : ''}
                </Text>
              ))}
          </View>
        </Row>
      </Pressable>
    </View>
  )
}

export default Profile
