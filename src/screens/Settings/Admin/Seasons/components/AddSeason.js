import React from 'react'
import {Button, Row, Text, TextInput, View} from '@ybase'
import {useTranslation} from 'react-i18next'
import {useLeague, useYBase} from '~/lib/hooks'

const AddSeason = props => {
  const [showAddNew, setShowAddNew] = React.useState(false)
  const [name, setName] = React.useState('')
  const [err, setErr] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [shortName, setShortName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const {t} = useTranslation()
  const {colors} = useYBase()
  const league = useLeague()

  function HandleCancel() {
    setShowAddNew(false)
    setName('')
    setShortName('')
    setDescription('')
  }

  async function HandleSave() {
    try {
      setErr('')
      setLoading(true)
      if (name && shortName) {
        const res = await league.AddNewSeason(name, shortName, description)
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          props.refresh()
          HandleCancel()
        }
      } else {
        setErr('invalid_parameters')
      }
    } catch (e) {
      console.log(e)
      setErr('server_error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View>
      <View mt={20}>
        <Button variant="outline" py={5} onPress={() => setShowAddNew(true)}>
          Add new season
        </Button>
      </View>
      {showAddNew && (
        <View>
          <View my={5}>
            <TextInput
              value={name}
              placeholder="Name (required)"
              onChangeText={text => setName(text)}
            />
          </View>
          <View my={5}>
            <TextInput
              value={shortName}
              placeholder="Short Name (required)"
              onChangeText={text => setShortName(text)}
            />
          </View>
          <View my={5}>
            <TextInput
              value={description}
              placeholder="Descriptions (optional)"
              onChangeText={text => setDescription(text)}
            />
          </View>
          {err && (
            <Text textAlign="center" color={colors.error}>
              {err}
            </Text>
          )}
          <Row alignItems="center" space={20}>
            <View flex={1}>
              <Button variant="outline" onPress={() => HandleCancel()}>
                {t('cancel')}
              </Button>
            </View>
            <View flex={1}>
              <Button loading={loading} onPress={() => HandleSave()}>{t('save')}</Button>
            </View>
          </Row>
        </View>
      )}
    </View>
  )
}

export default AddSeason
