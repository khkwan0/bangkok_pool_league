import React from 'react'
import ImagePicker from 'react-native-image-crop-picker'
import {Button, Pressable, Row, Text, View} from '@ybase'
import {useAccount, useYBase} from '~/lib/hooks'
import {Image} from 'react-native'
import config from '~/config'
import {useTranslation} from 'react-i18next'
import {useSelector} from 'react-redux'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'

const AvatarPicker = props => {
  const {colors} = useYBase()
  const {t} = useTranslation()
  const [newAvatar, setNewAvatar] = React.useState(null)
  const [showOptions, setShowOptions] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState('')
  const account = useAccount()
  const user = useSelector(_state => _state.userData).user

  async function HandleShowPicker(source = 'gallery') {
    let image = null
    const params = {
      width: 300,
      height: 300,
      cropping: true,
      cropperCircleOverlay: true,
      mediaType: 'photo',
    }
    if (source === 'gallery') {
      image = await ImagePicker.openPicker(params)
    } else {
      image = await ImagePicker.openCamera(params)
    }
    setNewAvatar(image)
  }

  React.useEffect(() => {
    return async () => await ImagePicker.clean()
  }, [])

  async function HandleSave() {
    try {
      setErr('')
      setLoading(true)
      const res = await account.SaveAvatar(newAvatar.path)
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        await account.FetchUser()
        props.navigation.goBack()
      } else {
        setErr(res.error)
      }
    } catch (e) {
      console.log(e)
      setErr('server_error')
    } finally {
      setLoading(false)
    }
  }

  function HandleReset() {
    setNewAvatar(null)
    setShowOptions(false)
  }

  return (
    <View flex={1} bgColor={colors.background} px={20}>
      <View flex={1} />
      <View flex={3}>
        <View alignItems="center">
          <Pressable onPress={() => setShowOptions(true)}>
            {newAvatar && (
              <Image
                source={{uri: newAvatar.path}}
                width={200}
                height={200}
                resizeMode="contain"
                style={{borderRadius: 100}}
              />
            )}
            {!newAvatar && user.profile_picture && (
              <>
                <Image
                  source={{uri: config.profileUrl + user.profile_picture}}
                  width={200}
                  height={200}
                  resizeMode="contain"
                  style={{borderRadius: 100}}
                />
                <Text textAlign="center">change</Text>
              </>
            )}
            {!newAvatar && !user.profile_picture && (
              <View
                bgColor={colors.profilePicBackground}
                width={200}
                height={200}
                borderRadius={100}
                alignItems="center"
                justifyContent="center">
                <MCI
                  name="plus-circle-outline"
                  color={colors.primary}
                  size={40}
                />
                <Text>upload</Text>
              </View>
            )}
          </Pressable>
          {newAvatar && (
            <View my={20}>
              <Button onPress={() => HandleReset()}>{t('reset')}</Button>
            </View>
          )}
          {showOptions && (
            <Row my={20} space={20}>
              <Button onPress={() => HandleShowPicker('gallery')}>
                {t('gallery')}
              </Button>
              <Button onPress={() => HandleShowPicker('camera')}>
                {t('camera')}
              </Button>
            </Row>
          )}
        </View>
      </View>
      <View flex={1}>
        {err && (
          <View my={20}>
            <Text color={colors.error} textAlign="center">
              {err}
            </Text>
          </View>
        )}
        <Button
          onPress={() => HandleSave()}
          disabled={newAvatar ? false : true}
          loading={loading}>
          {t('save')}
        </Button>
      </View>
    </View>
  )
}

export default AvatarPicker
