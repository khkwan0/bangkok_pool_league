import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {useLeagueContext} from '@/context/LeagueContext'
import Button from '@/components/Button'
import React, {useState} from 'react'
import DateTimePicker from 'react-native-modal-datetime-picker'
import {router} from 'expo-router'
import {DateTime} from 'luxon'
import ConfirmDialog from '@/components/ConfirmDialog'
import {useTranslation} from 'react-i18next'
import {useNavigation} from '@react-navigation/native'
import {useMatch} from '@/hooks/useMatch'

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
      <View className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <View className="w-full rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
            {/* Original Date Section */}
            <View className="mb-8">
              <Text
                type="subtitle"
                className="text-center text-gray-500 dark:text-gray-400 mb-1">
                {t('original_date')}
              </Text>
              <Text type="title" className="text-center font-bold text-lg">
                {DateTime.fromISO(
                  parsedMatchInfo.original_date ?? parsedMatchInfo.date,
                ).toFormat('DDDD')}
              </Text>
            </View>

            {/* Divider */}
            <View className="h-px bg-gray-200 dark:bg-gray-700 my-4" />

            {/* Proposed Date Section */}
            <View className="mb-8">
              <Text type="title" className="text-center font-bold text-xl mb-2">
                {t('proposed_date')}
              </Text>
              <Text
                type="subtitle"
                className="text-center mb-4 text-gray-700 dark:text-gray-300">
                {postponedDate
                  ? DateTime.fromJSDate(postponedDate).toFormat(
                      'dd LLL yyyy hh:mm a',
                    )
                  : t('no_date_selected')}
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="mt-4">
              <Button onPress={() => handleOpenDatePicker()}>
                {matchInfo.postponed_proposal?.newDate
                  ? t('propose_a_new_date')
                  : t('reschedule')}
              </Button>

              {/* Confirm button - only shown in specific conditions */}
              {postponedDate &&
                ((parsedMatchInfo.postponed_proposal?.isHome === true &&
                  parsedMatchInfo.player_team_id !==
                    parsedMatchInfo.home_team_id) ||
                  (parsedMatchInfo.postponed_proposal?.isHome === false &&
                    parsedMatchInfo.player_team_id ===
                      parsedMatchInfo.home_team_id)) && (
                  <Button
                    onPress={() => handleConfirmMatch()}
                    className="bg-green-600 dark:bg-green-700">
                    {t('confirm')}
                  </Button>
                )}
            </View>
          </View>
        </View>

        {/* Error Message */}
        {error ? (
          <View className="my-4 bg-red-100 p-4 rounded-lg">
            <Text className="text-red-600 text-center font-medium">
              {t('failed_to_postpone')}
            </Text>
          </View>
        ) : null}

        {/* Date Picker */}
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

        {/* Confirmation Dialog */}
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
