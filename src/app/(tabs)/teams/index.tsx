import React from 'react'
import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'
import TeamList from '@/components/Teams/TeamList'
import { ThemedView as View } from '@/components/ThemedView'

export default function TeamsScreen() {
  const { t } = useTranslation()

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: t('teams'),
          headerLargeTitle: true,
        }}
      />
      <TeamList />
    </View>
  )
} 