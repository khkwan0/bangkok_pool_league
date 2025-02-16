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
  const [newDate, setNewDate] = useState(null)
  const [isMounted, setIsMounted] = useState(false)
  const parsedMatchInfo =
    typeof matchInfo === 'string' ? JSON.parse(matchInfo) : matchInfo
  const [error, setError] = useState('')
  const {t} = useTranslation()

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
          timestamp: new Date().toISOString(),
        },
      })
      if (res.status === 'ok') {
        setPostponedDate(newDate)
        setShowConfirmPostponeDate(false)
      } else {
        setError('Failed to postpone to date')
      }
    } catch (error) {
      setError('Failed to postpone to date')
    }
  }

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

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

            <Button onPress={() => setShowDatePicker(true)}>
              {matchInfo.postponed_proposal?.newDate
                ? t('propose_a_new_date')
                : t('schedule_for_later')}
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
          onHide={() => setShowConfirmPostponeDate(true)}
          onCancel={() => setShowDatePicker(false)}
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
