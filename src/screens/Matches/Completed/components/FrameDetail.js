import React from 'react'
import {Pressable, Row, Text, View} from '@ybase'
import {Button, Dialog, Portal, Paragraph} from 'react-native-paper'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import {useSelector} from 'react-redux'
import {useMatch, useYBase} from '~/lib/hooks'

const FrameDetails = props => {
  const {homePlayers, awayPlayers} = props.item.item
  const [homeWin, setHomeWin] = React.useState(props.item.item.homeWin)
  const [isMounted, setIsMounted] = React.useState(false)
  const user = useSelector(_state => _state.userData).user
  const {colors} = useYBase()
  const match = useMatch()

  const [showDialogWin, setShowDialogWin] = React.useState({
    show: false,
    cb: null,
  })

  const isAdmin = user.role_id === 9 ? true : false

  async function UpdateMatchWin() {
    try {
      const data = props.item.item
      data.homeWin = homeWin
      const res = await match.UpdateCompletedMatch('win', props.matchId, data)
      setShowDialogWin({show: false, cb: null})
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    if (isMounted) {
      UpdateMatchWin()
    } else {
      setIsMounted(true)
    }
  }, [homeWin])

  function SetWinner() {
    setHomeWin(s => (s === 1 ? 0 : 1))
  }

  return (
    <>
      <Portal>
        <Dialog
          visible={showDialogWin.show}
          onDismiss={() => setShowDialogWin({show: false, cb: null})}>
          <Dialog.Title>Change Winner</Dialog.Title>
          <Dialog.Content>
            <Paragraph>This has already been set. Are you sure?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="contained" onPress={() => showDialogWin.cb()}>
              Confirm
            </Button>
            <Button onPress={() => setShowDialogWin({show: false, cb: null})}>
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <View my={10} px={20} key={'complete_frame_detail' + props.idx}>
        {isAdmin && <Text textAlign="center">{props.item.item.frameId}</Text>}
        <Row alignItems="center">
          <View flex={1}>
            {homePlayers.map((player, idx) => (
              <View key={'home_compelted' + idx}>
                {idx !== 0 && <Text>and</Text>}
                <Text bold>{player.nickName}</Text>
              </View>
            ))}
          </View>
          <View flex={1} justifyContent="center" alignItems="center">
            {homeWin === 1 && <MCI name="check" size={30} color="green" />}
            {homeWin === 0 && isAdmin && (
              <Pressable
                onPress={() => setShowDialogWin({show: true, cb: SetWinner})}>
                <MCI
                  name="close-circle-outline"
                  color={colors.error}
                  size={20}
                />
              </Pressable>
            )}
          </View>
          <View flex={0.3} alignItems="center">
            <Text>vs</Text>
          </View>
          <View flex={1} justifyContent="center" alignItems="center">
            {homeWin === 0 && <MCI name="check" size={30} color="green" />}
            {homeWin === 1 && isAdmin && (
              <Pressable
                onPress={() => setShowDialogWin({show: true, cb: SetWinner})}>
                <MCI
                  name="close-circle-outline"
                  color={colors.error}
                  size={20}
                />
              </Pressable>
            )}
          </View>
          <View flex={1} alignItems="flex-end">
            {awayPlayers.map((player, idx) => (
              <View key={'away_completed' + idx} alignItems="flex-end">
                {idx !== 0 && <Text>and</Text>}
                <Text bold>{player.nickName}</Text>
              </View>
            ))}
          </View>
        </Row>
      </View>
    </>
  )
}

export default FrameDetails
