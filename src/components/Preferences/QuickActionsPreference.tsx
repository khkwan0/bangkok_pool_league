import React, {useEffect, useMemo, useState} from 'react'
import {Pressable, Text, View} from 'react-native'
import {useTranslation} from 'react-i18next'
import {useTheme} from 'expo-router/react-navigation'
import {useLeagueContext} from '@/context/LeagueContext'
import {useAccount} from '@/hooks/useAccount'
import {
  ALL_QUICK_ACTIONS,
  DEFAULT_FAB_QUICK_ACTIONS,
  QUICK_ACTION_DEFS,
  resolveFabQuickActions,
  type QuickActionId,
} from '@/lib/quickActions'

/**
 * Show/hide + reorder FAB quick-action items; persists via user preferences API.
 */
export default function QuickActionsPreference() {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const {state} = useLeagueContext()
  const account = useAccount()

  const initial = useMemo(
    () => resolveFabQuickActions(state.user?.preferences?.fab_quick_actions),
    [state.user?.preferences?.fab_quick_actions],
  )
  const [actions, setActions] = useState<QuickActionId[]>(initial)

  useEffect(() => {
    setActions(initial)
  }, [initial])

  const selected = new Set(actions)

  async function persist(next: QuickActionId[] | null) {
    if (next != null && next.length === 0) {
      next = null
    }
    if (next == null) {
      setActions([...DEFAULT_FAB_QUICK_ACTIONS])
    } else {
      setActions(next)
    }
    await account.SetFabQuickActions(next)
  }

  function toggle(id: QuickActionId) {
    if (selected.has(id)) {
      const next = actions.filter(a => a !== id)
      if (next.length === 0) return
      void persist(next)
      return
    }
    void persist([...actions, id])
  }

  function move(id: QuickActionId, dir: -1 | 1) {
    const idx = actions.indexOf(id)
    if (idx < 0) return
    const nextIdx = idx + dir
    if (nextIdx < 0 || nextIdx >= actions.length) return
    const copy = [...actions]
    ;[copy[idx], copy[nextIdx]] = [copy[nextIdx]!, copy[idx]!]
    void persist(copy)
  }

  return (
    <View style={{flex: 1, padding: 16}}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: colors.text,
          marginBottom: 4,
        }}>
        {t('fab_quick_actions_settings')}
      </Text>
      <Text style={{color: colors.text, opacity: 0.7, marginBottom: 12}}>
        {t('fab_quick_actions_settings_description')}
      </Text>

      {actions.map((id, index) => {
        const def = QUICK_ACTION_DEFS[id]
        return (
          <View
            key={id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 8,
              backgroundColor: colors.card,
            }}>
            <Text style={{flex: 1, color: colors.text}}>
              {t(def.labelKey)}
            </Text>
            <Pressable
              onPress={() => move(id, -1)}
              disabled={index === 0}
              style={{opacity: index === 0 ? 0.3 : 1, paddingHorizontal: 8}}>
              <Text style={{color: colors.text}}>↑</Text>
            </Pressable>
            <Pressable
              onPress={() => move(id, 1)}
              disabled={index === actions.length - 1}
              style={{
                opacity: index === actions.length - 1 ? 0.3 : 1,
                paddingHorizontal: 8,
              }}>
              <Text style={{color: colors.text}}>↓</Text>
            </Pressable>
            <Pressable onPress={() => toggle(id)} style={{paddingHorizontal: 8}}>
              <Text style={{color: '#dc2626'}}>{t('hide')}</Text>
            </Pressable>
          </View>
        )
      })}

      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4}}>
        {ALL_QUICK_ACTIONS.filter(id => !selected.has(id)).map(id => {
          const def = QUICK_ACTION_DEFS[id]
          return (
            <Pressable
              key={id}
              onPress={() => toggle(id)}
              style={{
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: colors.border || colors.text,
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}>
              <Text style={{color: colors.text}}>+ {t(def.labelKey)}</Text>
            </Pressable>
          )
        })}
      </View>

      <Pressable
        onPress={() => void persist(null)}
        style={{marginTop: 16}}>
        <Text style={{color: '#2563eb'}}>
          {t('fab_quick_actions_reset_default')}
        </Text>
      </Pressable>
    </View>
  )
}
