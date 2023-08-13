import React from 'react'
import {Text, View} from 'react-native'
import {useAppSelector} from '~/lib/hooks/redux'
import {useAccount} from '~/lib/hooks'
import Login from '@screens/Auth/Login'
import {SafeAreaView} from 'react-native-safe-area-context'
import {Button} from 'react-native-paper'

const Account = props => {
  const account = useAccount()
  const [isMounted, setIsMounted] = React.useState(false)
  const {user} = useAppSelector(_state => _state.user)

  React.useEffect(() => {
    ;(async () => {
      try {
        await account.FetchUser()
        setIsMounted(true)
      } catch (e) {
        console.log(e)
      }
    })()
    return () => setIsMounted(false)
  }, [])

  async function Logout() {
    await account.Logout()
  }

  if (isMounted) {
    return (
      <SafeAreaView style={{flex: 1}}>
        {(typeof user?.data?.id === 'undefined' || !user?.data?.id) && (
          <>
            <View style={{flex: 1}} />
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                paddingLeft: '5%',
                paddingRight: '5%',
              }}>
              <Login />
            </View>
            <View style={{flex: 1}} />
          </>
        )}
        {typeof user?.data?.id !== 'undefined' && user?.data?.id && (
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 2}}>
              <Text>
                {user.data.firstname} {user?.data?.lastname[0] ?? ''}
              </Text>
            </View>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <Button mode="contained" icon="logout" onPress={() => Logout()}>
                Logout
              </Button>
            </View>
          </View>
        )}
      </SafeAreaView>
    )
  } else {
    return null
  }
}

export default Account
