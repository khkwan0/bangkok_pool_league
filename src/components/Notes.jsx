import React from 'react'
import {View} from 'react-native'
import {Button, IconButton, Text, TextInput} from 'react-native-paper'
import {useAppSelector} from '~/lib/hooks/redux'
import {DateTime} from 'luxon'
import {socket} from '~/socket'

const Notes = props => {
  const [newNote, setNewNote] = React.useState('')
  const [showAddNew, setAddNew] = React.useState(false)
  const [notes, setNotes] = React.useState(props.matchInfo?.meta?.notes ?? [])
  const user = useAppSelector(_state => _state.user)

  function HandleCancel() {
    setNewNote('')
  }

  function HandleSaveNewNote() {
    if (newNote) {
      props.handleSaveNote(newNote)
      setNewNote('')
      setAddNew(false)
    }
  }

  React.useEffect(() => {
    socket.on('match_update2', data => {
      if (data.type === 'newnote') {
        const _notes = [...notes]
        _notes.push(data)
        setNotes(_notes)
      }
    })
  }, [])

  return (
    <View>
      <Text variant="headlineMedium" style={{textAlign: 'center'}}>
        Notes
      </Text>
      {typeof notes !== 'undefined' &&
        notes.map((note, idx) => {
          return (
            <View key={'note' + idx}>
              <Text>
                {DateTime.fromMillis(note.timestamp).toLocaleString(
                  DateTime.DATETIME_SHORT_WITH_SECONDS,
                )}
              </Text>
              <View style={{flexDirection: 'row'}}>
                <Text>{note.author}: </Text>
                <Text>{note.note}</Text>
              </View>
            </View>
          )
        })}
      {!props.matchInfo.notes && (
        <View>
          <Text style={{textAlign: 'center'}} variant="bodyLarge">
            No notes
          </Text>
        </View>
      )}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Button
          icon="plus-circle"
          mode="outlined"
          onPress={() => setAddNew(true)}>
          <Text>Add a note</Text>
        </Button>
      </View>
      <View style={{margin: 10}}>
        {showAddNew && (
          <View>
            <TextInput
              placeholder="Add a note..."
              value={newNote}
              onChangeText={text => setNewNote(text)}
              multiline
              numberOfLines={3}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                margin: 5,
              }}>
              <Button mode="contained" onPress={() => HandleCancel()}>
                Cancel
              </Button>
              <Button onPress={() => HandleSaveNewNote()}>Save</Button>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

export default Notes
