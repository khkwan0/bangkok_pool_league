import React from 'react'
import {Button, Pressable, ScrollView, Text, TextInput, View} from '@ybase'
import {useAccount, useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'
import MCI from 'react-native-vector-icons/MaterialCommunityIcons'
import MI from 'react-native-vector-icons/MaterialIcons'

const RegisterPart1 = props => {
  const {colors} = useYBase()
  const [err, setErr] = React.useState('')
  const [nickname, setNickname] = React.useState('')
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [valid, setValid] = React.useState(false)
  const {t} = useTranslation()

  function HandleNext() {
    setErr('')
    if (!nickname) {
      setErr('nickname_required')
    } else {
      props.navigation.navigate('RegisterPart2', {
        nickname,
        firstName,
        lastName,
      })
    }
  }

  React.useEffect(() => {
    if (nickname.length > 3) {
      setValid(true)
    } else {
      setValid(false)
    }
  }, [nickname])

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 20,
      }}>
      <View flex={1}>
        <View mt={20}>
          <Text textAlign="center" bold fontSize="xxl">
            Bangkok Pool League
          </Text>
        </View>
        <View mt={20}>
          <Text bold fontSize="xl">
            create_account
          </Text>
          <Text bold fontSize="lg">
            {t('step')} 1/2
          </Text>
        </View>
      </View>
      <View flex={3} gap={20}>
        <View>
          <TextInput
            placeholder={t('nickname')}
            value={nickname}
            inputLeftElement={
              <View ml={10}>
                <MI name="person-outline" size={30} color={colors.onSurface} />
              </View>
            }
            inputRightElement={<Text px={10}>required</Text>}
            onChangeText={text => setNickname(text)}
          />
        </View>
        <View>
          <TextInput
            placeholder={t('first_name')}
            value={firstName}
            inputLeftElement={
              <View ml={10}>
                <MCI name="lock" size={30} color={colors.onSurface} />
              </View>
            }
            inputRightElement={<Text px={10}>optional</Text>}
            onChangeText={text => setFirstName(text)}
          />
        </View>
        <View>
          <TextInput
            placeholder={t('last_name')}
            value={lastName}
            inputLeftElement={
              <View ml={10}>
                <MCI name="lock" size={30} color={colors.onSurface} />
              </View>
            }
            inputRightElement={<Text px={10}>optional</Text>}
            onChangeText={text => setLastName(text)}
          />
        </View>
        {err && (
          <View mt={10}>
            <Text textAlign="center" fontSize="lg" color={colors.error}>
              {err}
            </Text>
          </View>
        )}
      </View>
      <View flex={1}>
        <Button disabled={!valid} onPress={() => HandleNext()}>
          {t('continue')}
        </Button>
      </View>
    </ScrollView>
  )
}

export default RegisterPart1
