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

export default function Postpone({matchInfo}: {matchInfo: any}) {
  const {state} = useLeagueContext()
  const user = state.user
  const match = useMatch()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showConfirmPostponeIndefinitely, setShowConfirmPostponeIndefinitely] =
    useState(false)
  const [dateSelected, setDateSelected] = useState(false)
  const [showConfirmPostponeDate, setShowConfirmPostponeDate] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const parsedMatchInfo =
    typeof matchInfo === 'string' ? JSON.parse(matchInfo) : matchInfo
  const [error, setError] = useState('aa')

  const handleIndefinitePostpone = async () => {
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
          newDate: selectedDate.toISOString(),
          timestamp: new Date().toISOString(),
        },
      })
      if (res.status === 'ok') {
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
            How would you like to postpone this match?
          </Text>

          <View style={{gap: 15}}>
            <Button onPress={() => setShowConfirmPostponeIndefinitely(true)}>
              Postpone Indefinitely
            </Button>

            <Button onPress={() => setShowDatePicker(true)}>
              Schedule for Later
            </Button>
          </View>
        </View>
        <View style={{flex: 1}}>
          <View>
            <Text>proposed_data</Text>
            <Text>
              {dateSelected
                ? DateTime.fromJSDate(selectedDate).toFormat('dd LLL yyyy hh:mm a')
                : 'No date selected'}
            </Text>
          </View>
          {error ? (
            <View className="my-4" style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </View>

        <DateTimePicker
          isVisible={showDatePicker}
          date={selectedDate}
          minimumDate={DateTime.fromISO(parsedMatchInfo.date)
            .plus({hours: 12})
            .toJSDate()}
          mode="datetime"
          is24Hour={false}
          minuteInterval={30}
          onHide={() => setShowConfirmPostponeDate(true)}
          onCancel={() => setShowDatePicker(false)}
          onConfirm={date => {
            console.log('date', date)
            setSelectedDate(date)
            setDateSelected(true)
            setShowDatePicker(false)
          }}
        />

        <ConfirmDialog
          isVisible={showConfirmPostponeIndefinitely}
          title="Confirm Indefinite Postponement"
          message="Are you sure you want to postpone this match indefinitely?"
          onConfirm={handleIndefinitePostpone}
          onCancel={() => setShowConfirmPostponeIndefinitely(false)}
        />

        <ConfirmDialog
          isVisible={showConfirmPostponeDate}
          title="Confirm Postponement"
          message={`Are you sure you want to postpone this match to ${DateTime.fromJSDate(
            selectedDate,
          ).toFormat('dd LLL yyyy hh:mm a')}?`}
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
