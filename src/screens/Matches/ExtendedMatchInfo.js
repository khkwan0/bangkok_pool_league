import React from 'react'
import {FlatList, View} from 'react-native'
import {Button, Divider} from 'react-native-paper'
import Notes from '@components/Notes'
import History from '@components/History'
import {useNetwork} from '~/lib/hooks'

const ExtendedMatchInfo = props => {
  const screens = [<Notes />, <History />]
  const network = useNetwork()
  const matchInfo = props.route.params.matchInfo

  async function HandleSaveNote(newNote = '') {
    network.SocketSend('newnote', matchInfo.match_id, {note: newNote})
  }

  return (
    <View style={{flex: 1}}>
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
