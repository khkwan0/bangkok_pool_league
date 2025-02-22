import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {useLeagueContext} from '@/context/LeagueContext'
import Button from '@/components/Button'
import React, {useState} from 'react'
import DateTimePicker from 'react-native-modal-datetime-picker'
import {StyleSheet} from 'react-native'
import {useMatch} from '@/hooks/useMatch'
import {router} from 'expo-router'
import {DateTime} from 'luxon'
import ConfirmDialog from '@/components/ConfirmDialog'
import {useTranslation} from 'react-i18next'
import {useNavigation} from '@react-navigation/native'

export default function Postpone({matchInfo}: {matchInfo: any}) {
  const {state} = useLeagueContext()
  const user = state.user
  const match = useMatch()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [postponedDate, setPostponedDate] = useState(
    matchInfo.postponed_proposal?.newDate
      ? DateTime.fromISO(matchInfo.postponed_proposal.newDate).toJSDate()
      : null,
  )
  const [showConfirmPostponeIndefinitely, setShowConfirmPostponeIndefinitely] =
    useState(false)
  const [dateSelected, setDateSelected] = useState(false)
  const [showConfirmPostponeDate, setShowConfirmPostponeDate] = useState(false)
  const [newDate, setNewDate] = useState<Date | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const parsedMatchInfo =
    typeof matchInfo === 'string' ? JSON.parse(matchInfo) : matchInfo
  const [error, setError] = useState('')
  const [wasCancelled, setWasCancelled] = useState(false)
  const {t} = useTranslation()
  const navigation = useNavigation()

  async function handleIndefinitePostpone() {
    try {
      await match.RescheduleMatch(parsedMatchInfo.match_id, null)
    } catch (error) {
      console.error('Failed to postpone indefinitely:', error)
    }
  }

  const handleConfirmDatePostpone = async () => {
    try {
      setError('')
      const res = await match.ProposeRescheduleMatch({
        matchId: parsedMatchInfo.match_id,
        proposedData: {
          isHome:
            parsedMatchInfo.player_team_id === parsedMatchInfo.home_team_id,
          userId: user.id,
          newDate: newDate,
          teamId: parsedMatchInfo.player_team_id,
          timestamp: new Date().toISOString(),
        },
      })
      if (res.status === 'ok') {
        setPostponedDate(newDate)
        setShowConfirmPostponeDate(false)
        router.back()
        router.setParams({
          params: JSON.stringify({
            refresh: true,
          }),
        })
      } else {
        setError('Failed to postpone to date')
      }
    } catch (error) {
      setError('Failed to postpone to date')
    }
  }

  const handleConfirmMatch = async () => {
    try {
      const res = await match.ConfirmMatch(
        parsedMatchInfo.match_id,
        parsedMatchInfo.player_team_id,
      )
      if (res.status === 'ok') {
        router.back()
        router.setParams({
          params: JSON.stringify({
            refresh: true,
          }),
        })
      } else {
        setError(t('failed_to_confirm_match'))
      }
    } catch (error) {
      console.error('Failed to confirm match:', error)
      setError(t('failed_to_confirm_match'))
    }
  }

  React.useEffect(() => {
    navigation.setOptions({
      title: t('reschedule_match'),
    })
    setIsMounted(true)
  }, [])

  function handleCancel() {
    setShowDatePicker(false)
    setWasCancelled(true)
  }

  function handleHide() {
    if (!wasCancelled) {
      setShowConfirmPostponeDate(true)
    }
  }

  function handleOpenDatePicker() {
    setShowDatePicker(true)
    setWasCancelled(false)
  }

  if (isMounted) {
    return (
      <View style={{flex: 1, padding: 20}}>
        <View style={{flex: 1}}>
          <Text style={{fontSize: 18, marginBottom: 20, textAlign: 'center'}}>
            {t('postpone_match')}
          </Text>

          <View style={{gap: 15}}>
            <Button onPress={() => setShowConfirmPostponeIndefinitely(true)}>
              {t('postpone_indefinitely')}
            </Button>

            <Button onPress={() => handleOpenDatePicker()}>
              {matchInfo.postponed_proposal?.newDate
                ? t('propose_a_new_date')
                : t('reschedule')}
            </Button>
          </View>
        </View>
        <View style={{flex: 1}}>
          <View>
            <Text type="title" className="text-center">
              {t('proposed_date')}
            </Text>
            <Text type="subtitle" className="text-center">
              {postponedDate
                ? DateTime.fromJSDate(postponedDate).toFormat(
                    'dd LLL yyyy hh:mm a',
                  )
                : t('no_date_selected')}
            </Text>
            {/* if the match is postponed and the user is NOT on the team that proposed the date, show the confirm button */}
            {postponedDate &&
              ((parsedMatchInfo.postponed_proposal?.isHome === true &&
                parsedMatchInfo.player_team_id !==
                  parsedMatchInfo.home_team_id) ||
                (parsedMatchInfo.postponed_proposal?.isHome === false &&
                  parsedMatchInfo.player_team_id ===
                    parsedMatchInfo.home_team_id)) && (
                <Button onPress={() => handleConfirmMatch()}>
                  {t('confirm')}
                </Button>
              )}
          </View>
          {error ? (
            <View className="my-4" style={styles.errorContainer}>
              <Text style={styles.errorText}>{t('failed_to_postpone')}</Text>
            </View>
          ) : null}
        </View>

        <DateTimePicker
          isVisible={showDatePicker}
          date={newDate || new Date()}
          minimumDate={new Date()}
          mode="datetime"
          is24Hour={false}
          minuteInterval={30}
          onHide={handleHide}
          onCancel={handleCancel}
          onConfirm={date => {
            setNewDate(date)
            setDateSelected(true)
            setShowDatePicker(false)
          }}
        />

        <ConfirmDialog
          isVisible={showConfirmPostponeIndefinitely}
          title={t('postpone_indefinitely')}
          message={t('confirm_postpone_indefinitely')}
          onConfirm={handleIndefinitePostpone}
          onCancel={() => setShowConfirmPostponeIndefinitely(false)}
        />

        <ConfirmDialog
          isVisible={showConfirmPostponeDate}
          title={t('schedule_for_later')}
          message={t('confirm_postpone_date', {
            date: postponedDate
              ? DateTime.fromJSDate(newDate || new Date()).toFormat(
                  'dd LLL yyyy hh:mm a',
                )
              : t('no_date_selected'),
          })}
          onConfirm={handleConfirmDatePostpone}
          onCancel={() => setShowConfirmPostponeDate(false)}
        />
      </View>
    )
  } else {
    return null
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 32,
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    fontWeight: '500',
  },
})
