import React from 'react'
import {Button, Divider, Row, ScrollView, Text, TextInput, View} from '@ybase'
import {useLeague, useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {
  Button as RNPButton,
  Portal,
  Dialog,
  Text as RNPText,
} from 'react-native-paper'

const PlayerDetails = props => {
  const {t} = useTranslation()
  const playerInfo = props.route.params.playerInfo
  const {colors} = useYBase()
  const [player, setPlayer] = React.useState({})
  const [playerId, setPlayerId] = React.useState(playerInfo.id)
  const [nickname, setNickname] = React.useState('')
  const [firstname, setFirstname] = React.useState('')
  const [lastname, setLastname] = React.useState('')
  const [targetId, setTargetId] = React.useState('')
  const [mergedId, setMergedId] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState('')
  const [email, setEmail] = React.useState(playerInfo.email)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [altIds, setAltIds] = React.useState([])
  const insets = useSafeAreaInsets()

  const league = useLeague()

  async function GetPlayer() {
    try {
      const res = await league.GetRawPlayerInfo(playerId)
      console.log(res.data)
      setPlayer(res.data)
      setNickname(res?.data?.nickname)
      setLastname(res?.data?.lastname)
      setFirstname(res?.data?.firstname)
      setEmail(res?.data?.email)
      setMergedId(res?.data?.merged_with_id)
      setTargetId((res?.data?.merged_with_id ?? 0).toString())
      setAltIds(res?.data?.altIds ?? [])
    } catch (e) {
      console.log(e)
      setErr('server_error')
    }
  }
  React.useEffect(() => {
    GetPlayer()
  }, [])

  async function DoMerge() {
    try {
      setLoading(true)
      setErr('')
      if (parseInt(targetId, 10) > -1) {
        const res = await league.MergePlayer(playerId, parseInt(targetId, 10))
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          GetPlayer()
        } else {
          setErr(res.error)
        }
      } else {
        setErr('Bad value')
      }
    } catch (e) {
      console.log(e)
      setErr('server_error')
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  async function HandleSave(key, value) {
    try {
      setLoading(true)
      setErr('')
      const res = await league.SetPlayerAttribute(playerId, key, value)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        GetPlayer()
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  async function HandleMergeRequest() {
    setErr('')
    try {
      if (parseInt(targetId, 10) > -1) {
        setShowConfirm(true)
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <>
      <Portal>
        <Dialog visible={showConfirm} onDismiss={() => setShowConfirm(false)}>
          <Dialog.Title>Merge Confirm</Dialog.Title>
          <Dialog.Content>
            <RNPText style={{textAlign: 'center'}}>
              Confirm merge {nickname} id # {playerId} with:
            </RNPText>
            <RNPText style={{fontWeight: 'bold', textAlign: 'center'}}>
              {targetId}
            </RNPText>
          </Dialog.Content>
          <Dialog.Actions>
            <RNPButton onPress={() => setShowConfirm(false)}>Cancel</RNPButton>
            <RNPButton onPress={() => DoMerge()}>Confirm</RNPButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          backgroundColor: colors.background,
          paddingBottom: insets.bottom,
        }}>
        {err && (
          <View>
            <Text textAlign="center" color={colors.error}>
              {err}
            </Text>
          </View>
        )}
        <View my={20}>
          <Row alignItems="center" space={20}>
            <View flex={1}>
              <Text fontSize="xl">User ID</Text>
            </View>
            <View flex={1}>
              <Text fontSize="xxl" bold>
                {playerId}
              </Text>
            </View>
          </Row>
          {mergedId > 0 && (
            <Row alignItems="center" space={20}>
              <View flex={1}>
                <Text fontSize="xl">Merged with ID</Text>
              </View>
              <View flex={1}>
                <Text fontSize="xxl" bold>
                  {mergedId}
                </Text>
              </View>
            </Row>
          )}
          {altIds.length > 0 && (
            <Row alignItems="center" space={20}>
              <View flex={1}>
                <Text fontSize="xl">Alt IDs</Text>
              </View>
              <View flex={1}>
                {altIds.map(altId => (
                  <Text key={'altid' + altId.id} fontSize="xxl" nold>
                    {altId.id}
                  </Text>
                ))}
              </View>
            </Row>
          )}
        </View>
        <Divider />
        <View my={20}>
          <Row alignItems="center" space={10}>
            <View flex={1}>
              <Text fontSize="xl">
                Merge with id: (this id will be the master)
              </Text>
            </View>
            <View flex={3}>
              <TextInput
                keyboardType="number-pad"
                value={targetId}
                onChangeText={text => setTargetId(text)}
              />
            </View>
          </Row>
          <View mt={10}>
            <Button loading={loading} onPress={() => HandleMergeRequest()}>
              Merge
            </Button>
          </View>
        </View>
        <Divider />
        <View my={20}>
          <Row alignItems="center" space={10}>
            <View flex={1}>
              <Text fontSize="xl">Nickname</Text>
            </View>
            <View flex={3}>
              <TextInput
                value={nickname}
                onChangeText={text => setNickname(text)}
              />
            </View>
          </Row>
          <Row alignItems="center" space={10} mt={10}>
            <View flex={1}>
              <Button
                loading={loading}
                variant="outline"
                onPress={() => setNickname(player.nickname)}>
                {t('cancel')}
              </Button>
            </View>
            <View flex={1}>
              <Button
                loading={loading}
                onPress={() => HandleSave('nickname', nickname)}>
                {t('save')}
              </Button>
            </View>
          </Row>
        </View>
        <Divider />
        <View my={20}>
          <Row alignItems="center" space={10}>
            <View flex={1}>
              <Text fontSize="xl">First name</Text>
            </View>
            <View flex={3}>
              <TextInput
                value={firstname}
                onChangeText={text => setFirstname(text)}
              />
            </View>
          </Row>
          <Row alignItems="center" space={10} mt={10}>
            <View flex={1}>
              <Button
                loading={loading}
                variant="outline"
                onPress={() => setFirstname(player.firstname)}>
                {t('cancel')}
              </Button>
            </View>
            <View flex={1}>
              <Button
                loading={loading}
                onPress={() => HandleSave('firstname', firstname)}>
                {t('save')}
              </Button>
            </View>
          </Row>
        </View>
        <Divider />
        <View my={20}>
          <Row alignItems="center" space={10}>
            <View flex={1}>
              <Text fontSize="xl">Last name</Text>
            </View>
            <View flex={3}>
              <TextInput
                value={lastname}
                onChangeText={text => setLastname(text)}
              />
            </View>
          </Row>
          <Row alignItems="center" space={10} mt={10}>
            <View flex={1}>
              <Button
                loading={loading}
                variant="outline"
                onPress={() => setLastname(player.lastname)}>
                {t('cancel')}
              </Button>
            </View>
            <View flex={1}>
              <Button loading={loading} onPress={() => HandleSave('lastname')}>
                {t('save')}
              </Button>
            </View>
          </Row>
        </View>
        <Divider />
        <View my={20}>
          <Row alignItems="center" space={10}>
            <View flex={1}>
              <Text fontSize="xl">Email</Text>
            </View>
            <View flex={3}>
              <TextInput
                keyboardType="email-address"
                value={email}
                onChangeText={text => setEmail(text)}
              />
            </View>
          </Row>
          <Row alignItems="center" space={10} mt={10}>
            <View flex={1}>
              <Button
                loading={loading}
                variant="outline"
                onPress={() => setEmail(player.email)}>
                {t('cancel')}
              </Button>
            </View>
            <View flex={1}>
              <Button loading={loading} onPress={() => HandleSave('email')}>
                {t('save')}
              </Button>
            </View>
          </Row>
        </View>
      </ScrollView>
    </>
  )
}

export default PlayerDetails
