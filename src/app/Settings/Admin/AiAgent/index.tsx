import CueChat from '@/app/Settings/CueChat'
import {ThemedText as Text} from '@/components/ThemedText'
import {ThemedView as View} from '@/components/ThemedView'
import {useLeagueContext} from '@/context/LeagueContext'
import {Stack, useRouter} from 'expo-router'
import React from 'react'
import {useTranslation} from 'react-i18next'

export default function AdminAiAgentScreen() {
  const {t} = useTranslation()
  const router = useRouter()
  const {state} = useLeagueContext()
  const isAdmin = Number(state.user?.role_id) === 9

  React.useEffect(() => {
    if (!isAdmin) {
      router.replace('/Settings')
    }
  }, [isAdmin, router])

  if (!isAdmin) {
    return (
      <>
        <Stack.Screen options={{title: t('admin_ai_agent')}} />
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{textAlign: 'center'}}>
            {t('admin_ai_agent_unauthorized')}
          </Text>
        </View>
      </>
    )
  }

  return <CueChat agentScope="admin" />
}
