import {ThemedText as Text} from '@/components/ThemedText'
import {useLeagueContext} from '@/context/LeagueContext'
import {
  NON_CANONICAL_ACCENT,
  competitionDisplayName,
  competitionModeLabel,
  isCanonicalCompetition,
} from '@/types/competition'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import React from 'react'
import {Pressable, useColorScheme, View} from 'react-native'

/**
 * Persistent strip above the tab bar when not in Bangkok Pool League mode.
 */
export function CompetitionModeBanner() {
  const {state, openCompetitionPicker} = useLeagueContext()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const competition = state.competition

  if (isCanonicalCompetition(competition)) {
    return null
  }

  const modeLabel = competitionModeLabel(competition) || 'OTHER'
  const name = competitionDisplayName(competition)

  return (
    <Pressable
      onPress={openCompetitionPicker}
      accessibilityRole="button"
      accessibilityLabel={`${modeLabel} mode: ${name}. Tap to switch competition`}
      style={{
        backgroundColor: NON_CANONICAL_ACCENT,
        paddingHorizontal: 14,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: isDark ? '#880E4F' : '#AD1457',
      }}>
      <MCI name="trophy" size={18} color="#fff" />
      <View style={{flex: 1, minWidth: 0}}>
        <Text
          style={{
            color: '#fff',
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 1,
          }}>
          {modeLabel} MODE
        </Text>
        <Text
          numberOfLines={1}
          style={{color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 1}}>
          {name}
        </Text>
      </View>
      <Text style={{color: '#fff', fontSize: 12, fontWeight: '600', opacity: 0.95}}>
        Switch
      </Text>
      <MCI name="swap-horizontal" size={20} color="#fff" />
    </Pressable>
  )
}
