import React from 'react'
import {View} from 'react-native'
import {Button, TextInput} from 'react-native-paper'
import {useAccount} from '~/lib/hooks'
import LineLogin from '@xmartlabs/react-native-line'

const Login = (props: any) => {
  const {Login} = useAccount()
  const [email, setEmail] = React.useState('')
  const [secure, setSecure] = React.useState(true)
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function AttemptLogin() {
    try {
      setLoading(true)
      await Login(email, password)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  async function HandleLineLogin() {
    try {
      const res = await LineLogin.login()
      console.log(res)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <View style={{flex: 1}}>
      <Button onPress={() => HandleLineLogin()}>LINE</Button>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <TextInput
          label="Email"
          value={email}
          left={<TextInput.Icon icon="email" />}
          onChangeText={text => setEmail(text)}
        />
      </View>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <TextInput
          secureTextEntry={secure}
          label="Password"
          value={password}
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon
              icon={secure ? 'eye' : 'eye-off'}
              onPress={() => setSecure(s => !s)}
            />
          }
          onChangeText={text => setPassword(text)}
        />
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Button mode="contained" icon="login" loading={loading} disabled={loading} onPress={() => AttemptLogin()}>Login</Button>
        </View>
      </View>
    </View>
  )
}

export default Login
