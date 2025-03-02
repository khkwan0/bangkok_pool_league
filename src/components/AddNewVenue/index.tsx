import React, {useState} from 'react'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {useLeague} from '@/hooks/useLeague'
import {TextInput, ScrollView, ActivityIndicator, TouchableOpacity} from 'react-native'
import {useTranslation} from 'react-i18next'
import {router, Stack} from 'expo-router'
import {Ionicons} from '@expo/vector-icons'

export default function AddNewVenue() {
  const league = useLeague()
  const [venueName, setVenueName] = useState('')
  const [venueAddress, setVenueAddress] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const {t} = useTranslation()

  function handleCancel() {
    router.back()
  }

  async function handleSave() {
    if (!venueName) {
      setErr('venue_name_required')
    } else {
      try {
        setErr('')
        setLoading(true)
        const res = await league.SaveVenue({
          name: venueName,
          address: venueAddress,
        })
        if (typeof res.status !== 'undefined' && res.status === 'ok') {
          router.back()
        } else {
          setErr(res.error)
        }
      } catch (e: unknown) {
        console.log(e)
        setErr(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <>
      <Stack.Screen options={{title: t('add_new_venue')}} />
      <ScrollView className="bg-gray-100">
        <View className="p-4">
          <View className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <Text className="text-2xl font-bold mb-6 text-center">{t('add_new_venue')}</Text>
            
            <View className="mb-6">
              <Text className="mb-2 font-medium text-gray-700">{t('venue_name')}</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-1 bg-gray-50"
                value={venueName}
                onChangeText={setVenueName}
                placeholder={t('enter_venue_name')}
              />
            </View>
            
            <View className="mb-6">
              <Text className="mb-2 font-medium text-gray-700">{t('venue_address')}</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-1 bg-gray-50"
                value={venueAddress}
                onChangeText={setVenueAddress}
                placeholder={t('enter_venue_address')}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{minHeight: 100}}
              />
            </View>
            
            {err ? (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <Text className="text-red-600">{t(err)}</Text>
              </View>
            ) : null}
            
            <View className="flex-row justify-between mt-2">
              <TouchableOpacity
                className="bg-gray-200 py-3 px-6 rounded-lg flex-1 mr-2 items-center"
                onPress={handleCancel}
                disabled={loading}
              >
                <Text className="font-medium text-gray-700">{t('cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`py-3 px-6 rounded-lg flex-1 ml-2 items-center ${
                  loading ? 'bg-blue-300' : 'bg-blue-500'
                }`}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="font-medium text-white">{t('save')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  )
} 