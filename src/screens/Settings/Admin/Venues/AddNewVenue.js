import React from 'react'
import {Button, Row, ScrollView, Text, TextInput, View} from '@ybase'
import {useLeague, useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'

const AddNewVenue = props => {
  const {t} = useTranslation()
  const [name, setName] = React.useState('')
  const [shortName, setShortName] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [website, setWebsite] = React.useState('')
  const [plus, setPlus] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [lat, setLat] = React.useState(0.0)
  const [lng, setLng] = React.useState(0.0)
  const [err, setErr] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const league = useLeague()
  const {colors} = useYBase()

  async function HandleSave() {
    try {
      setLoading(true)
      setErr('')
      const res = await league.SaveVenue({
        name,
        short_name: shortName,
        location,
        phone,
        latitude: lat,
        longitude: lng,
        email,
        website,
        plus,
      })
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        props.refresh()
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
    <ScrollView
      contentContainerStyle={{flexGrow: 1, backgroundColor: colors.background}}>
      <Text textAlign="center" fontSize="xxl">
        add_new_venue
      </Text>
      <View mt={20}>
        <TextInput
          value={name}
          onChangeText={text => setName(text)}
          placeholder={t('name') + ' (' + t('required') + ')'}
        />
      </View>
      <View mt={20}>
        <TextInput
          value={shortName}
          onChangeText={text => setShortName(text)}
          placeholder={t('short_name')}
        />
      </View>
      <View mt={20}>
        <TextInput
          value={location}
          onChangeText={text => setLocation(text)}
          placeholder={t('location') + ' (' + t('required') + ')'}
        />
      </View>
      <View mt={20}>
        <TextInput
          value={phone}
          onChangeText={text => setPhone(text)}
          placeholder={t('phone')}
        />
      </View>
      <View mt={20}>
        <TextInput
          value={lat}
          onChangeText={text => setLat(text)}
          placeholder={t('latitude')}
        />
      </View>
      <View mt={20}>
        <TextInput
          value={lng}
          onChangeText={text => setLng(text)}
          placeholder={t('longitude')}
        />
      </View>
      <View mt={20}>
        <TextInput
          value={website}
          onChangeText={text => setWebsite(text)}
          placeholder={t('website')}
        />
      </View>
      <View mt={20}>
        <TextInput
          value={email}
          onChangeText={text => setEmail(text)}
          placeholder={t('email')}
        />
      </View>
      <View mt={20}>
        <TextInput
          value={plus}
          onChangeText={text => setPlus(text)}
          placeholder={t('plus')}
        />
      </View>
      {err && (
        <View mt={20}>
          <Text textAlign="center" color={colors.error}>
            {err}
          </Text>
        </View>
      )}
      <View mt={20}>
        <Row alignItems="center" space={20}>
          <View flex={1}>
            <Button
              loading={loading}
              variant="outline"
              onPress={() => props.cancel()}>
              {t('cancel')}
            </Button>
          </View>
          <View flex={1}>
            <Button loading={loading} onPress={() => HandleSave()}>
              {t('save')}
            </Button>
          </View>
        </Row>
      </View>
    </ScrollView>
  )
}

export default AddNewVenue
