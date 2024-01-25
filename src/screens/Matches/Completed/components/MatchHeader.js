import React from 'react'
import {Row, Text, View} from '@ybase'
import {
  Button,
  Dialog,
  Paragraph,
  Portal,
  RadioButton,
} from 'react-native-paper'
import {useMatch} from '~/lib/hooks'

const MatchHeader = props => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [firstBreak, setFirstBreak] = React.useState(
    props.matchData.first_break_home_team
      ? props.matchData.home_team_id
      : props.matchData.away_team_id,
  )
  const [showDialogFirstBreak, setShowDialogFirstBreak] = React.useState({
    show: false,
    cb: null,
  })
  const match = useMatch()

  async function DoSetFirstBreak(teamId) {
    setFirstBreak(teamId)
    // save first break
    await match.UpdateCompletedMatch('break', props.matchData.matchId, {
      home_team_first_break: teamId === props.matchData.home_team_id ? 1 : 0,
    })
    setShowDialogFirstBreak({show: false, cb: null})
  }

  function HandleSetFirstBreak(teamId) {
    if (firstBreak !== 0) {
      setShowDialogFirstBreak({show: true, cb: () => DoSetFirstBreak(teamId)})
    } else {
      DoSetFirstBreak(teamId)
    }
  }

  return (
    <>
      <Portal>
        <Dialog
          visible={showDialogFirstBreak.show}
          onDismiss={() => setShowDialogFirstBreak({show: false, cb: null})}>
          <Dialog.Title>Change First Break</Dialog.Title>
          <Dialog.Content>
            <Paragraph>This has already been set. Are you sure?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="contained" onPress={() => showDialogFirstBreak.cb()}>
              Confirm
            </Button>
            <Button
              onPress={() => setShowDialogFirstBreak({show: false, cb: null})}>
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <View px={20}>
        <Row alignItems="center">
          <View flex={2}>
            <Text bold fontSize="xl" textAlign="center">
              {props.matchData.home_team_name}
            </Text>
          </View>
          <View flex={1}>
            <Text textAlign="center">vs</Text>
          </View>
          <View flex={2}>
            <Text bold fontSize="xl" textAlign="center">
              {props.matchData.away_team_name}
            </Text>
          </View>
        </Row>
        <RadioButton.Group
          onValueChange={newValue => HandleSetFirstBreak(newValue)}
          value={firstBreak}>
          <Row alignItems="center">
            <Row alignItems="center" justifyContent="center" flex={1}>
              <RadioButton.Android
                disabled={isLoading}
                value={props.matchData.home_team_id}
              />
              <Text>first_break</Text>
            </Row>
            <Row flex={1} alignItems="center" justifyContent="center">
              <RadioButton.Android
                disabled={isLoading}
                value={props.matchData.away_team_id}
              />
              <Text>first_break</Text>
            </Row>
          </Row>
        </RadioButton.Group>
      </View>
    </>
  )
}

export default MatchHeader
