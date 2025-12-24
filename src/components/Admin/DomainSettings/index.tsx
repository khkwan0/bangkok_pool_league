import Button from '@/components/Button'
import { ThemedText as Text } from '@/components/ThemedText'
import config from '@/config'
import { useLeagueContext } from '@/context/LeagueContext'
import { useNavigation } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from 'react-native'

export default function DomainSettings() {
  const navigation = useNavigation()
  const {t} = useTranslation()
  const {apiUrl, setApiUrl, resetApiUrl} = useLeagueContext()
  const [customDomain, setCustomDomain] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  React.useEffect(() => {
    navigation.setOptions({
      title: 'Domain Settings',
    })
  }, [navigation])

  const handleReset = async () => {
    setIsSubmitting(true)
    try {
      await resetApiUrl()
    } catch (error) {
      console.error('Failed to reset domain:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetPreset = async () => {
    setIsSubmitting(true)
    try {
      // Remove https:// if present, we'll add it in useNetwork
      const cleanDomain = 'https://api.bkkleague.com'
      await setApiUrl(cleanDomain)
    } catch (error) {
      console.error('Failed to set preset domain:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!customDomain.trim()) {
      return
    }
    setIsSubmitting(true)
    try {
      // Remove https:// if present, we'll add it in useNetwork
      let cleanDomain = customDomain.trim()
      if (cleanDomain.startsWith('https://')) {
        cleanDomain = cleanDomain.replace('https://', '')
      }
      if (cleanDomain.startsWith('http://')) {
        cleanDomain = cleanDomain.replace('http://', '')
      }
      await setApiUrl(cleanDomain)
      setCustomDomain('')
    } catch (error) {
      console.error('Failed to set custom domain:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1">
      <ScrollView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-lg font-bold mb-2">Current Domain</Text>
          <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <Text className="text-base font-mono">{apiUrl}</Text>
          </View>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            API endpoints will use: {apiUrl}
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold mb-4">Quick Actions</Text>
          
          <View className="mb-3">
            <Button
              onPress={handleReset}
              disabled={isSubmitting || apiUrl === config.apiUrl}
              className="bg-gray-600 active:bg-gray-700 py-3 px-4 rounded-lg items-center mb-2">
              <Text className="text-white">
                Reset to Default ({config.apiUrl})
              </Text>
            </Button>
          </View>

          <View className="mb-3">
            <Button
              onPress={handleSetPreset}
              disabled={isSubmitting || apiUrl === 'https://api.bkkleague.com'}
              className="bg-blue-600 active:bg-blue-700 py-3 px-4 rounded-lg items-center mb-2">
              <Text className="text-white">
                Set to api.bkkleague.com
              </Text>
            </Button>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold mb-4">Custom Domain</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Enter a custom domain (https:// will be added automatically)
          </Text>
          <TextInput
            className="border p-3 rounded-lg mb-3 dark:bg-gray-800 dark:text-white dark:border-gray-700"
            placeholder="e.g., api.example.com or example.com/api"
            value={customDomain}
            onChangeText={setCustomDomain}
            editable={!isSubmitting}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button
            onPress={handleSubmit}
            disabled={isSubmitting || !customDomain.trim()}
            className="bg-green-600 active:bg-green-700 py-3 px-4 rounded-lg items-center">
            <Text className="text-white">Submit Custom Domain</Text>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

