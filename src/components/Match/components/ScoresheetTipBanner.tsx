import {useLeagueContext} from '@/context/LeagueContext'
import {useMatchContext} from '@/context/MatchContext'
import {frameHasCompleteRosters} from '@/lib/matchFormat'
import {
  dismissScoresheetTip,
  loadDismissedScoresheetTips,
  resolveScoresheetTip,
  saveShowScoresheetTips,
  type ScoresheetTip,
} from '@/lib/scoresheetTips'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Pressable, Text, View} from 'react-native'
import {useScoresheetTheme} from './scoresheetTheme'

function localizeSides(
  t: (key: string) => string,
  sides: string | number | undefined,
): string {
  if (sides == null || sides === '') return ''
  return String(sides)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      if (s === 'home') return t('home')
      if (s === 'away') return t('away')
      return s
    })
    .join(', ')
}

export default function ScoresheetTipBanner() {
  const {t} = useTranslation()
  const theme = useScoresheetTheme()
  const {state: leagueState, dispatch: leagueDispatch} = useLeagueContext()
  const {state, dispatch}: any = useMatchContext()
  const [dismissed, setDismissed] = React.useState<string[]>([])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      const ids = await loadDismissedScoresheetTips()
      if (!cancelled) setDismissed(ids)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Drop Win tip once both sides have a full roster again.
  React.useEffect(() => {
    if (state.tipOverride?.id !== 'win_players_required') return
    const list = state.frameData ?? []
    const unfinished = list.find(
      (f: {frameNumber?: number; winner?: number}) =>
        Number(f.frameNumber) > 0 && Number(f.winner ?? 0) <= 0,
    )
    if (!unfinished || frameHasCompleteRosters(unfinished)) {
      dispatch({type: 'SET_TIP_OVERRIDE', payload: null})
    }
  }, [state.frameData, state.tipOverride, dispatch])

  const tip: ScoresheetTip | null = React.useMemo(() => {
    const override = (state.tipOverride as ScoresheetTip | null) ?? null
    return resolveScoresheetTip({
      enabled: leagueState.showScoresheetTips !== false,
      dismissed,
      override,
      frames: state.frameData,
      format: state.matchInfo?.format,
      homeTeamId: Number(state.matchInfo?.home_team_id ?? 0),
      awayTeamId: Number(state.matchInfo?.away_team_id ?? 0),
      firstBreak: state.firstBreak,
    })
  }, [
    leagueState.showScoresheetTips,
    dismissed,
    state.tipOverride,
    state.frameData,
    state.matchInfo?.format,
    state.matchInfo?.home_team_id,
    state.matchInfo?.away_team_id,
    state.firstBreak,
  ])

  if (!tip) return null

  const params = {
    ...(tip.params ?? {}),
    sides: localizeSides(t, tip.params?.sides),
  }

  async function handleDismiss() {
    if (state.tipOverride?.id === tip!.id) {
      dispatch({type: 'SET_TIP_OVERRIDE', payload: null})
    }
    const next = await dismissScoresheetTip(tip!.id)
    setDismissed(next)
  }

  async function handleTurnOff() {
    leagueDispatch({type: 'SET_SHOW_SCORESHEET_TIPS', payload: false})
    await saveShowScoresheetTips(false)
    dispatch({type: 'SET_TIP_OVERRIDE', payload: null})
  }

  return (
    <View
      style={{
        marginHorizontal: 12,
        marginBottom: 8,
        borderRadius: 14,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.cardBorder,
        padding: 12,
        gap: 8,
        ...theme.shadow,
      }}>
      <View style={{flexDirection: 'row', alignItems: 'flex-start', gap: 10}}>
        <MCI
          name="lightbulb-on-outline"
          size={22}
          color={theme.win}
          style={{marginTop: 1}}
        />
        <View style={{flex: 1, gap: 4}}>
          <Text
            style={{
              color: theme.text,
              fontSize: 14,
              fontWeight: '800',
            }}>
            {t(tip.titleKey, params)}
          </Text>
          <Text
            style={{
              color: theme.muted,
              fontSize: 13,
              fontWeight: '500',
              lineHeight: 18,
            }}>
            {t(tip.bodyKey, params)}
          </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 16,
          paddingLeft: 32,
        }}>
        <Pressable onPress={() => void handleDismiss()} hitSlop={6}>
          <Text style={{color: theme.win, fontWeight: '700', fontSize: 13}}>
            {t('tip_dismiss')}
          </Text>
        </Pressable>
        <Pressable onPress={() => void handleTurnOff()} hitSlop={6}>
          <Text style={{color: theme.muted, fontWeight: '600', fontSize: 13}}>
            {t('tip_turn_off')}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
