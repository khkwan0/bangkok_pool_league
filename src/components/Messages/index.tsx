import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useAccount} from '@/hooks/useAccount'
import {useLeagueContext} from '@/context/LeagueContext'
import React from 'react'
import {FlatList, ActivityIndicator, Pressable} from 'react-native'
import MessageCard from './MessageCard'
import Button from '@/components/Button'
import {useTranslation} from 'react-i18next'
import {useTheme, useNavigation} from '@react-navigation/native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

export default function Messages() {
  const account = useAccount()
  const {state} = useLeagueContext()
  const userId = state.user.id
  const [messages, setMessages] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const {t} = useTranslation()
  const {colors} = useTheme()
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  React.useEffect(() => {
    navigation.setOptions({
      title: t('messages'),
    })
  }, [navigation, t])

  React.useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (userId) {
          setLoading(true)
          const res = await account.GetMessages(userId)
          if (res.status === 'ok') {
            setMessages(res.data)
          }
        }
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [userId])

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={{flex: 1}}>
      <View style={{flex: 10}}>
        <FlatList
          data={messages}
          renderItem={({item}) => <MessageCard message={item} />}
          ListEmptyComponent={
            <View className="py-8 justify-center items-center">
              <Text className="opacity-60">{t('no_messages')}</Text>
            </View>
          }
        />
      </View>
      {messages.length > 9 && (
        <View
          style={{flex: 1, paddingBottom: insets.bottom}}
          className="items-center justify-center">
          <Button onPress={() => {}}>{t('mark_all_read')}</Button>
        </View>
      )}
    </View>
  )
}
