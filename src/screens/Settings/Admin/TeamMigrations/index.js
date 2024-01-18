import React from 'react'
import {useLeague, useYBase} from '~/lib/hooks'
import {Button, Text, TextInput, View} from '@ybase'

const TeamMigrations = props => {
  const {colors} = useYBase()
  const [err, setErr] = React.useState('')
  const [oldSeason, setOldSeason] = React.useState('')
  const [newSeason, setNewSeason] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const league = useLeague()

  async function HandleMigrate() {
    try {
      setLoading(true)
      setErr('')
      const res = await league.Migrate(oldSeason, newSeason)
      if (res.status !== 'undefined' && res.status === 'ok') {
      } else {
        setErr(res.error)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View flex={1} bgColor={colors.background} px={20}>
      <View flex={1} />
      <View flex={2}>
        <View>
          <TextInput
            placeholder="old_season"
            value={oldSeason}
            onChangeText={text => setOldSeason(text)}
          />
        </View>
        <View mt={20}>
          <TextInput
            placeholder="new_season"
            value={newSeason}
            onChangeText={text => setNewSeason(text)}
          />
        </View>
      </View>
      <View flex={2}>
        {err && (
          <View>
            <Text textAlign="center" color={colors.error}>
              {err}
            </Text>
          </View>
        )}
        <View>
          <Text color={colors.error} textAlign="center" bold fontSize="xxxl">
            DANGEROUS DO NOT SUBMIT UNLESS YOU KNOW WHAT YOU ARE DOING
          </Text>
        </View>
        <View mt={20}>
          <Button loading={loading} onPress={() => HandleMigrate()}>
            submit
          </Button>
        </View>
      </View>
    </View>
  )
}

export default TeamMigrations
