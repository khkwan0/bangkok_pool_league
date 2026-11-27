import {
  availabilityPrompt,
  refreshAvailability,
  subscribeAvailability,
  writeAvailabilityPrompt,
  type AvailabilityPrompt,
  type AvailabilityStatus,
} from '@/lib/matchAvailability'
import {useLeagueContext} from '@/context/LeagueContext'
import {useNetwork} from '@/hooks/useNetwork'
import {BANGKOK_ZONE} from '@/lib/bangkokTime'
import {DateTime} from 'luxon'
import * as Haptics from 'expo-haptics'
import React from 'react'
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import {useTranslation} from 'react-i18next'
import {useFocusEffect} from 'expo-router'

type RosterPerson = {id: number; name: string; note: string | null}
type Roster = {
  in: RosterPerson[]
  out: RosterPerson[]
  pending: RosterPerson[]
}

function weekdayLabel(date: string | undefined, locale: string) {
  if (!date) return ''
  const raw = String(date).trim().replace(' ', 'T')
  const parsed = DateTime.fromISO(raw, {zone: BANGKOK_ZONE})
  const dt = parsed.isValid
    ? parsed
    : DateTime.fromJSDate(new Date(raw)).setZone(BANGKOK_ZONE)
  if (!dt.isValid) return ''
  return dt.setLocale(locale || 'en').toFormat('cccc')
}

export function MatchAvailability({
  matchId,
  date,
  accent,
  textColor,
  mutedColor,
  borderColor,
  surfaceColor,
  style,
}: {
  matchId: number
  date?: string
  accent: string
  textColor: string
  mutedColor: string
  borderColor: string
  surfaceColor: string
  style?: StyleProp<ViewStyle>
}) {
  const {t, i18n} = useTranslation()
  const {Get, Post} = useNetwork()
  const {state} = useLeagueContext()
  const userId = Number(state.user?.id || 0)
  const getRef = React.useRef(Get)
  const postRef = React.useRef(Post)
  getRef.current = Get
  postRef.current = Post
  const [, bump] = React.useState(0)
  const [editing, setEditing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')
  const [note, setNote] = React.useState('')
  const [rosterOpen, setRosterOpen] = React.useState(false)
  const [roster, setRoster] = React.useState<Roster | null>(null)
  const [rosterError, setRosterError] = React.useState('')
  const [rosterLoading, setRosterLoading] = React.useState(false)
  const [reminding, setReminding] = React.useState(false)
  const [reminded, setReminded] = React.useState(false)

  React.useEffect(() => subscribeAvailability(() => bump(n => n + 1)), [])

  useFocusEffect(
    React.useCallback(() => {
      if (!userId || !matchId) return
      void refreshAvailability(getRef.current, userId, true)
    }, [userId, matchId]),
  )

  const prompt = availabilityPrompt(matchId)

  React.useEffect(() => {
    setNote(prompt?.note ?? '')
    if (!prompt?.mine) setEditing(true)
  }, [prompt?.matchId, prompt?.mine, prompt?.note])

  if (!userId || !prompt) return null

  const day = weekdayLabel(date, i18n.language)
  const showChoices = editing || !prompt.mine

  async function choose(status: AvailabilityStatus) {
    if (saving) return
    setSaving(true)
    setError('')
    void Haptics.selectionAsync()
    const res = await postRef.current(`/match/${matchId}/availability`, {
      status,
      note: status === 'out' ? note : '',
    })
    setSaving(false)
    if (res?.status === 'ok' && res.prompt) {
      writeAvailabilityPrompt(userId, res.prompt as AvailabilityPrompt)
      setEditing(false)
      return
    }
    setError(t('availability_failed'))
  }

  async function saveNote() {
    if (prompt?.mine !== 'out') return
    const res = await postRef.current(`/match/${matchId}/availability`, {
      status: 'out',
      note,
    })
    if (res?.status === 'ok' && res.prompt) {
      writeAvailabilityPrompt(userId, res.prompt as AvailabilityPrompt)
    }
  }

  async function openRoster() {
    setRosterOpen(true)
    setRosterLoading(true)
    setRosterError('')
    const res = await getRef.current(`/match/${matchId}/availability`)
    setRosterLoading(false)
    if (res?.status === 'ok') {
      setRoster({
        in: res.in || [],
        out: res.out || [],
        pending: res.pending || [],
      })
      return
    }
    setRoster(null)
    setRosterError(t('availability_failed'))
  }

  async function remind() {
    if (reminding || reminded) return
    setReminding(true)
    const res = await postRef.current(`/match/${matchId}/availability/remind`, {})
    setReminding(false)
    if (res?.status === 'ok' || res?.error === 'already_reminded') {
      setReminded(true)
    }
  }

  const sections: Array<{key: 'in' | 'out' | 'pending'; title: string}> = [
    {key: 'in', title: t('availability_heading_in')},
    {key: 'out', title: t('availability_heading_out')},
    {key: 'pending', title: t('availability_heading_pending')},
  ]

  return (
    <View
      style={[
        styles.wrap,
        {borderColor, backgroundColor: surfaceColor},
        style,
      ]}>
      <Text style={[styles.question, {color: textColor}]}>
        {day ? t('availability_playing', {day}) : t('availability_playing_plain')}
      </Text>

      {showChoices ? (
        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={() => choose('in')}
            style={({pressed}) => [
              styles.choice,
              {
                backgroundColor: accent,
                opacity: saving ? 0.6 : pressed ? 0.85 : 1,
              },
            ]}>
            <Text style={styles.choiceOn}>{t('availability_in')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={() => choose('out')}
            style={({pressed}) => [
              styles.choice,
              styles.choiceGhost,
              {
                borderColor: accent,
                opacity: saving ? 0.6 : pressed ? 0.85 : 1,
              },
            ]}>
            <Text style={[styles.choiceGhostText, {color: accent}]}>
              {t('availability_out')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.answeredRow}>
          <Text style={[styles.answered, {color: textColor}]}>
            {prompt.mine === 'in'
              ? t('availability_you_in')
              : t('availability_you_out')}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setEditing(true)}
            hitSlop={8}>
            <Text style={[styles.change, {color: accent}]}>
              {t('availability_change')}
            </Text>
          </Pressable>
        </View>
      )}

      {prompt.mine === 'out' ? (
        <TextInput
          value={note}
          onChangeText={value => setNote(value.slice(0, 80))}
          onEndEditing={() => void saveNote()}
          placeholder={t('availability_note')}
          placeholderTextColor={mutedColor}
          style={[
            styles.note,
            {color: textColor, borderColor, backgroundColor: surfaceColor},
          ]}
        />
      ) : null}

      {prompt.isCaptain && prompt.counts ? (
        <Pressable accessibilityRole="button" onPress={() => void openRoster()}>
          <Text style={[styles.counts, {color: accent}]}>
            {t('availability_counts', {
              inCount: prompt.counts.in,
              outCount: prompt.counts.out,
              pendingCount: prompt.counts.pending,
            })}
          </Text>
        </Pressable>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal
        visible={rosterOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setRosterOpen(false)}>
        <View style={styles.modalFill}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setRosterOpen(false)}
          />
          <View style={[styles.sheet, {backgroundColor: surfaceColor}]}>
            <Text style={[styles.sheetTitle, {color: textColor}]}>
              {t('availability_roster')}
            </Text>
            {rosterLoading ? (
              <ActivityIndicator color={accent} style={{marginVertical: 24}} />
            ) : rosterError ? (
              <Text style={styles.error}>{rosterError}</Text>
            ) : (
              <ScrollView style={{maxHeight: 360}}>
                {sections.map(section => {
                  const people = roster?.[section.key] ?? []
                  return (
                    <View key={section.key} style={styles.section}>
                      <Text style={[styles.sectionTitle, {color: mutedColor}]}>
                        {section.title}
                      </Text>
                      {people.length === 0 ? (
                        <Text style={[styles.person, {color: mutedColor}]}>
                          {t('availability_none')}
                        </Text>
                      ) : (
                        people.map(person => (
                          <View key={person.id} style={styles.personBlock}>
                            <Text style={[styles.person, {color: textColor}]}>
                              {person.name}
                            </Text>
                            {person.note ? (
                              <Text style={[styles.personNote, {color: mutedColor}]}>
                                {person.note}
                              </Text>
                            ) : null}
                          </View>
                        ))
                      )}
                    </View>
                  )
                })}
              </ScrollView>
            )}
            {(roster?.pending.length ?? 0) > 0 ? (
              <Pressable
                accessibilityRole="button"
                disabled={reminding || reminded}
                onPress={() => void remind()}
                style={({pressed}) => [
                  styles.remind,
                  {
                    backgroundColor: accent,
                    opacity: reminding || reminded ? 0.6 : pressed ? 0.85 : 1,
                  },
                ]}>
                <Text style={styles.choiceOn}>
                  {reminded ? t('availability_reminded') : t('availability_remind')}
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => setRosterOpen(false)}
              style={styles.close}>
              <Text style={[styles.change, {color: accent}]}>
                {t('availability_close')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  question: {
    fontSize: 15,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  choice: {
    flex: 1,
    borderRadius: 12,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  choiceOn: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  choiceGhost: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  choiceGhostText: {
    fontSize: 15,
    fontWeight: '700',
  },
  answeredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  answered: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  change: {
    fontSize: 15,
    fontWeight: '700',
  },
  note: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
  },
  counts: {
    fontSize: 14,
    fontWeight: '700',
  },
  error: {
    color: '#DC2626',
    fontSize: 13,
  },
  modalFill: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  personBlock: {
    paddingVertical: 3,
  },
  person: {
    fontSize: 16,
  },
  personNote: {
    fontSize: 13,
    marginTop: 1,
  },
  remind: {
    borderRadius: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  close: {
    alignItems: 'center',
    paddingVertical: 8,
  },
})
