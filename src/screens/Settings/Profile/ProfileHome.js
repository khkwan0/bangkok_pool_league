import React from 'react'
import {Button, Pressable, Row, ScrollView, Text, TextInput, View} from '@ybase'
import {useAccount, useLeague, useYBase} from '~/lib/hooks'
import {useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {Image} from 'react-native'
import config from '~/config'

const Profile = props => {
  const {colors} = useYBase()
  const {t} = useTranslation()
  const user = useSelector(_state => _state.userData).user
  const [playerInfo, setPlayerInfo] = React.useState(null)
  const [nickName, setNickName] = React.useState(user.nickname)
  const [firstName, setFirstName] = React.useState(user.firstname)
  const [lastName, setLastName] = React.useState(user.lastname)
  const [editLastName, setEditLastName] = React.useState(false)
  const [editFirstName, setEditFirstName] = React.useState(false)
  const [editNickname, setEditNickName] = React.useState(false)
  const [lastNameErr, setLastNameErr] = React.useState('')
  const [firstNameErr, setFirstNameErr] = React.useState('')
  const [nickNameErr, setNickNameErr] = React.useState('')
  const [isMounted, setIsMounted] = React.useState(false)
  const account = useAccount()
  const league = useLeague()

  React.useEffect(() => {
    props.navigation.setOptions({
      headerTitle: user.nickname ?? t('profile'),
    })
  }, [])

  async function HandleSaveLastName() {
    try {
      setLastNameErr('')
      const res = await account.SetLastName(lastName)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        setEditLastName(false)
      } else {
        setLastNameErr(res.error)
      }
    } catch (e) {
      console.log(e)
      setLastNameErr('server_error')
    }
  }

  async function HandleSaveFirstName() {
    try {
      setFirstNameErr('')
      const res = await account.SetFirstName(firstName)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        setEditFirstName(false)
      } else {
        setFirstNameErr(res.error)
      }
    } catch (e) {
      console.log(e)
      setFirstNameErr('server_error')
    }
  }

  async function HandleSaveNickName() {
    try {
      setNickNameErr('')
      if (nickName.length > 1) {
        const res = await account.SetNickName(nickName)
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          setEditNickName(false)
        } else {
          setNickNameErr(res.error)
        }
      } else {
        setNickNameErr('too_short')
      }
    } catch (e) {
      console.log(e)
      setNickNameErr('server_error')
    }
  }

  async function GetPlayerStatsInfo() {
    try {
      const res = await league.GetPlayerStatsInfo(user.id)
      setPlayerInfo(res)
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    GetPlayerStatsInfo()
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (isMounted && !editNickname) {
      ;(async () => {
        const _user = await account.FetchUser()
        setNickName(_user.nickname)
      })()
    }
  }, [editNickname])

  React.useEffect(() => {
    if (isMounted && !editFirstName) {
      ;(async () => {
        const _user = await account.FetchUser()
        setFirstName(_user.firstname)
      })()
    }
  }, [editFirstName])

  React.useEffect(() => {
    if (isMounted && !editLastName) {
      ;(async () => {
        const _user = await account.FetchUser()
        setLastName(_user.lastname)
      })()
    }
  }, [editLastName])

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 20,
      }}>
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
                maxLength={32}
                value={nickName}
                onChangeText={text => setNickName(text)}
              />
              {nickNameErr && (
                <View mt={10}>
                  <Text textAlign="center" color={colors.error}>
                    {nickNameErr}
                  </Text>
                </View>
              )}
              <Row alignItems="center" space={20} my={10}>
                <Button
                  variant="outline"
                  onPress={() => setEditNickName(false)}>
                  {t('cancel')}
                </Button>
                <Button onPress={() => HandleSaveNickName()}>
                  {t('save')}
                </Button>
              </Row>
            </>
          )}
          {!editNickname && (
            <Pressable
              py={5}
              px={20}
              onPress={() => setEditFirstName(true)}
              bgColor={colors.pressableUnpressed}>
              <Text fontSize="xl">{nickName ?? ''}</Text>
            </Pressable>
          )}
        </View>
      </Row>
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
                maxLength={32}
                value={firstName}
                onChangeText={text => setFirstName(text)}
              />
              {firstNameErr && (
                <View mt={10}>
                  <Text textAlign="center" color={colors.error}>
                    {firstNameErr}
                  </Text>
                </View>
              )}
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
          {!editFirstName && (
            <Pressable
              py={5}
              px={20}
              onPress={() => setEditFirstName(true)}
              bgColor={colors.pressableUnpressed}>
              <Text fontSize="xl">{firstName ?? ''}</Text>
            </Pressable>
          )}
        </View>
      </Row>
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
                maxLength={32}
                value={lastName}
                onChangeText={text => setLastName(text)}
              />
              {lastNameErr && (
                <View mt={10}>
                  <Text textAlign="center" color={colors.error}>
                    {lastNameErr}
                  </Text>
                </View>
              )}
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
          {!editLastName && (
            <Pressable
              py={5}
              px={20}
              onPress={() => setEditLastName(true)}
              bgColor={colors.pressableUnpressed}>
              <Text fontSize="xl">{lastName ?? ''}</Text>
            </Pressable>
          )}
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
            user.teams.map((team, idx) => (
              <Text key={team.name + idx}>
                {team.name}{' '}
                {team.team_role_id === 2 ? '(' + t('captain') + ')' : ''}
                {team.team_role_id === 1 ? '(' + t('asst_captain') + ')' : ''}
              </Text>
            ))}
        </View>
      </Row>
      <View mt={20}>
        <Button
          variant="outline"
          disabled={!playerInfo}
          onPress={() =>
            props.navigation.navigate('Player Statistics', {
              playerInfo: playerInfo,
            })
          }>
          {t('statistics')}
        </Button>
      </View>
    </ScrollView>
  )
}

export default Profile
