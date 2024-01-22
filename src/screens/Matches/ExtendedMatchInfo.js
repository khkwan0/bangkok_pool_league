import React from 'react'
import {FlatList} from 'react-native'
import {View} from '@ybase'
import {Button, Divider} from 'react-native-paper'
import Notes from '@components/Notes'
import History from '@components/History'
import {useNetwork, useYBase} from '~/lib/hooks'

const ExtendedMatchInfo = props => {
  const screens = [<Notes />, <History />]
  const network = useNetwork()
  const matchInfo = props.route.params.matchInfo
  const {colors} = useYBase()

  async function HandleSaveNote(newNote = '') {
    network.SocketSend('newnote', matchInfo.match_id, {note: newNote})
  }

  return (
    <View flex={1} bgColor={colors.background}>
      <FlatList
        data={screens}
        ItemSeparatorComponent={<Divider style={{marginVertical: 10}} bold />}
        renderItem={({item, index}) => {
          if (index === 0) {
            return (
              <Notes matchInfo={matchInfo} handleSaveNote={HandleSaveNote} />
            )
          }
          if (index === 1) {
            return (
              <History
                history={matchInfo.meta?.history}
                matchInfo={matchInfo}
              />
            )
          }
        }}
      />
    </View>
  )
}

export default ExtendedMatchInfo
