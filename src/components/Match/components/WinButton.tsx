import ConfirmDialog from '@/components/ConfirmDialog'
import {useLeagueContext} from '@/context/LeagueContext'
import {useMatchContext} from '@/context/MatchContext'
import {isLeagueAdmin} from '@/lib/isLeagueAdmin'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import * as Haptics from 'expo-haptics'
import * as React from 'react'
import {useTranslation} from 'react-i18next'
import {Alert, Pressable, Text} from 'react-native'
import {useScoresheetTheme} from './scoresheetTheme'

interface WinButtonProps {
  winner: number
  HandleWin: Function
  ClearWinner: Function
  teamId?: number | string
  side: string
  goldenBreak: boolean
  /** Shows a Golden break button (9-ball only). */
  allowGoldenBreak?: boolean
  accent: string
  onAccent: string
}

export default function WinButton({
  winner,
  HandleWin,
  ClearWinner,
  teamId,
  side,
  goldenBreak,
  allowGoldenBreak = false,
  accent,
  onAccent,
}: WinButtonProps) {
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [showConfirmUndo, setShowConfirmUndo] = React.useState(false)
  const {t} = useTranslation()
  const theme = useScoresheetTheme()
  const {state}: any = useMatchContext()
  const {state: leagueState}: any = useLeagueContext()
  const user = leagueState.user
  const [isPressed, setIsPressed] = React.useState(false)
  const [goldenPressed, setGoldenPressed] = React.useState(false)
  const [trackedWinner, setTrackedWinner] = React.useState(winner)
  const [trackedGolden, setTrackedGolden] = React.useState(goldenBreak)

  if (winner !== trackedWinner || goldenBreak !== trackedGolden) {
    setTrackedWinner(winner)
    setTrackedGolden(goldenBreak)
    setIsPressed(false)
    setGoldenPressed(false)
  }

  function canRecord(): boolean {
    if (state.finalizedHome && state.finalizedAway) {
      Alert.alert(t('match_completed'))
      return false
    }
    if (typeof user?.id === 'undefined') {
      Alert.alert(t('user_not_logged_in'))
      return false
    }
    try {
      const {home_team_id: homeTeamId, away_team_id: awayTeamId} =
        state.matchInfo
      const playerList = [
        ...Object.keys(state.teams?.[awayTeamId] ?? {}),
        ...Object.keys(state.teams?.[homeTeamId] ?? {}),
      ]
      if (playerList.includes(user.id.toString()) || isLeagueAdmin(user)) {
        return true
      }
    } catch (e) {
      console.error(e)
    }
    Alert.alert(t('user_not_on_team'))
    return false
  }

  function tryWin(withGoldenBreak = false) {
    if (!canRecord()) return
    HandleWin(side, withGoldenBreak)
  }

  function tryClear() {
    if (!canRecord()) return
    ClearWinner()
  }

  const bar = {
    minHeight: 40,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    alignSelf: 'stretch' as const,
    marginTop: 10,
  }

  const showGoldenAction = allowGoldenBreak && !winner
  const goldenInk = goldenPressed
    ? theme.goldInk
    : theme.isDark
      ? theme.gold
      : theme.goldInk

  return (
    <>
      {showConfirm && (
        <ConfirmDialog
          onConfirm={() => {
            tryWin()
            setShowConfirm(false)
          }}
          onCancel={() => setShowConfirm(false)}
          isVisible={showConfirm}
          title={t('confirm_winner_change')}
          message={t('confirm_winner_change_message')}
        />
      )}
      {showConfirmUndo && (
        <ConfirmDialog
          onConfirm={() => {
            tryClear()
            setShowConfirmUndo(false)
          }}
          onCancel={() => setShowConfirmUndo(false)}
          isVisible={showConfirmUndo}
          title={t('confirm_clear_winner')}
          message={t('confirm_clear_winner_message')}
        />
      )}
      {winner === teamId && (
        <Pressable
          onPress={() => {
            if (!canRecord()) return
            setShowConfirmUndo(true)
          }}
          accessibilityRole="button"
          accessibilityLabel={
            goldenBreak ? t('golden_break_action') : t('win')
          }
          accessibilityHint={
            goldenBreak ? t('golden_break_undo_hint') : undefined
          }
          style={{
            ...bar,
            backgroundColor: goldenBreak ? theme.gold : theme.win,
            paddingVertical: goldenBreak ? 6 : 0,
          }}>
          <MCI
            name={goldenBreak ? 'star' : 'check'}
            color={goldenBreak ? theme.goldInk : '#FFFFFF'}
            size={goldenBreak ? 16 : 20}
          />
          {goldenBreak ? (
            <>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={{
                  marginTop: 1,
                  color: theme.goldInk,
                  fontSize: 12,
                  fontWeight: '800',
                }}>
                {t('golden_break_action')}
              </Text>
              <Text
                style={{
                  color: theme.goldInk,
                  fontSize: 10,
                  fontWeight: '600',
                  opacity: 0.8,
                }}>
                {t('golden_break_undo_hint')}
              </Text>
            </>
          ) : null}
        </Pressable>
      )}
      {winner !== teamId && !winner && (
        <Pressable
          style={{
            ...bar,
            borderWidth: 1.5,
            borderColor: accent,
            backgroundColor: isPressed ? accent : 'transparent',
          }}
          accessibilityRole="button"
          accessibilityLabel={t('win')}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
            tryWin()
          }}>
          <Text
            style={{
              color: isPressed ? onAccent : accent,
              fontSize: 14,
              fontWeight: '800',
              letterSpacing: 0.8,
            }}>
            {t('win').toUpperCase()}
          </Text>
        </Pressable>
      )}
      {winner !== teamId && winner !== 0 && (
        <Pressable
          onPress={() => {
            if (!canRecord()) return
            setShowConfirm(true)
          }}
          style={{...bar, backgroundColor: theme.faint}}>
          <MCI name="close" color={theme.muted} size={18} />
        </Pressable>
      )}
      {showGoldenAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('golden_break_action')}
          onPressIn={() => setGoldenPressed(true)}
          onPressOut={() => setGoldenPressed(false)}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            tryWin(true)
          }}
          style={{
            ...bar,
            marginTop: 6,
            minHeight: 34,
            flexDirection: 'row',
            gap: 5,
            paddingHorizontal: 8,
            borderWidth: 1.5,
            borderColor: theme.gold,
            backgroundColor: goldenPressed
              ? theme.gold
              : theme.isDark
                ? 'rgba(245,197,66,0.16)'
                : 'rgba(245,197,66,0.28)',
          }}>
          <MCI name="star" color={goldenInk} size={14} />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={{
              flexShrink: 1,
              color: goldenInk,
              fontSize: 12,
              fontWeight: '800',
            }}>
            {t('golden_break_action')}
          </Text>
        </Pressable>
      ) : null}
    </>
  )
}
