import {useStatColors} from '@/components/PlayerStatistics/statUi'
import {Ionicons} from '@expo/vector-icons'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from 'react-native'

export function RankingScoreInfoButton({
  size = 18,
  color,
}: {
  size?: number
  color?: string
}) {
  const {t} = useTranslation()
  const colors = useStatColors()
  const scheme = useColorScheme()
  const [open, setOpen] = React.useState(false)
  const iconColor = color ?? colors.muted
  const cardBg = scheme === 'dark' ? 'rgba(30,41,59,0.98)' : '#fff'
  const border =
    scheme === 'dark' ? 'rgba(148,163,184,0.25)' : 'rgba(15,23,42,0.08)'

  const paragraphs = [
    t('ranking_score_info_points'),
    t('ranking_score_info_mgp'),
    t('ranking_score_info_wins'),
    t('ranking_score_info_formula'),
    t('ranking_score_info_penalty'),
    t('ranking_score_info_example'),
  ]

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={t('ranking_score_info_title')}
        style={{padding: 2}}>
        <Ionicons name="information-circle-outline" size={size} color={iconColor} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(15,23,42,0.55)',
            justifyContent: 'center',
            padding: 24,
          }}>
          <Pressable
            onPress={() => setOpen(false)}
            style={{position: 'absolute', top: 0, right: 0, bottom: 0, left: 0}}
          />
          <View
            style={{
              backgroundColor: cardBg,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: border,
              padding: 20,
              maxHeight: '80%',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
                gap: 8,
              }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: '700',
                  flex: 1,
                }}>
                {t('ranking_score_info_title')}
              </Text>
              <Pressable
                onPress={() => setOpen(false)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t('close')}>
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>
            <ScrollView style={{maxHeight: 420}}>
              {paragraphs.map((para, i) => (
                <Text
                  key={i}
                  style={{
                    color: colors.text,
                    fontSize: 14,
                    lineHeight: 21,
                    marginBottom: i === paragraphs.length - 1 ? 0 : 12,
                    opacity: 0.92,
                  }}>
                  {para}
                </Text>
              ))}
            </ScrollView>
            <Pressable
              onPress={() => setOpen(false)}
              style={{
                marginTop: 16,
                backgroundColor: colors.accent,
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: 'center',
              }}>
              <Text style={{color: '#fff', fontWeight: '700'}}>
                {t('close')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  )
}
