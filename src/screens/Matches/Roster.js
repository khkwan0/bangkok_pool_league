import React from 'react'
import {FlatList, View} from 'react-native'
import PlayerCard from '@components/PlayerCard'
import {Button, Modal, Portal, TextInput} from 'react-native-paper'
import NewPlayerInput from '@components/NewPlayerInput'
import {useLeague} from '~/lib/hooks'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
/*
        <Portal>
          <Modal
            visible={
              showRoster.teamId >= 0 &&
              showRoster.frameIdx >= 0 &&
              showRoster.playerIdx >= 0
            }
            contentContainerStyle={{
              backgroundColor: 'white',
              padding: 20,
              margin: 10,
              maxHeight: '80%',
            }}
            onDismiss={() =>
              setShowRoster({frameIdx: -1, teamId: -1, playerIdx: -1})
            }>
            <Roster
              players={teams[showRoster.teamId]}
              frameInfo={showRoster}
              handleSelect={HandleSelect}
              cancel={CancelPlayerSelect}
            />
          </Modal>
        </Portal>
        */
const Roster = props => {
  const insets = useSafeAreaInsets()
  const [showAddNew, setShowAddNew] = React.useState(false)
  const [allPlayers, setAllPlayers] = React.useState([])
  const league = useLeague()

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await league.GetPlayers()
        setAllPlayers(res)
      } catch (e) {
        console.log(e)
      }
    })()
  }, [])

  // this is a "goBack" with params
  function HandleSelect(playerId, newPlayer = false) {
    setShowAddNew(false)
    props.navigation.navigate('Match Screen', {
      player: {
        playerId: playerId,
        frameInfo: props.route.params.frameInfo,
        newPlayer: newPlayer,
      },
    })
  }

  return (
    <View style={{paddingBottom: insets.bottom}}>
      <Portal>
        <Modal visible={showAddNew} onDismiss={() => setShowAddNew(false)}>
          <View style={{backgroundColor: 'white', height: '90%', margin: 20}}>
            <Button onPress={() => setShowAddNew(false)}>Cancel</Button>
            <NewPlayerInput
              allPlayers={allPlayers}
              frameInfo={props.route.params.frameInfo}
              handleSelect={HandleSelect}
            />
          </View>
        </Modal>
      </Portal>
      <FlatList
        ItemSeparatorComponent={<View style={{marginVertical: 5}} />}
        ListHeaderComponent={
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              backgroundColor: 'white',
              padding: 5,
              paddingBottom: 10,
            }}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}>
              <Button
                icon="arrow-left"
                mode="contained"
                onPress={() => props.navigation.goBack()}>
                Back
              </Button>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'flex-end',
              }}>
              <Button
                icon="plus-circle"
                mode="contained"
                onPress={() => setShowAddNew(true)}>
                Add Player
              </Button>
            </View>
          </View>
        }
        stickyHeaderIndices={[0]}
        data={props.route.params.teams[props.route.params.frameInfo.teamId]}
        renderItem={({item, index}) => {
          // check to see if how many times a player can play in a section (aka mfpp)
          let i = 0
          let count = 0
          let disabled = false
          const playerId = item.playerId
          while (i < props.route.params.frames.length) {
            const frame = props.route.params.frames[i]
            if (
              frame.type !== 'section' &&
              frame.section === props.route.params.section
            ) {
              if (
                frame.homePlayerIds.includes(playerId) ||
                frame.awayPlayerIds.includes(playerId)
              ) {
                count++
              }
            }
            i++
          }
          if (count >= props.route.params.mfpp) {
            disabled = true
          }

          // if doubles, make sure same person can't be chosen
          const frame =
            props.route.params.frames[props.route.params.frameInfo.frameIdx]
          if (
            frame.homePlayerIds.includes(playerId) ||
            frame.awayPlayerIds.includes(playerId)
          ) {
            disabled = true
          }

          return (
            <PlayerCard
              idx={index}
              disabled={disabled}
              player={item}
              handleSelect={HandleSelect}
              frameInfo={props.route.params.frameInfo}
              abbrevLast
            />
          )
        }}
      />
    </View>
  )
}

export default Roster
