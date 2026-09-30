import {useMatchContext} from '@/context/MatchContext'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import * as Haptics from 'expo-haptics'
import {useTranslation} from 'react-i18next'
import {Pressable, Text, View} from 'react-native'
import FirstBreak from './FirstBreak'
import Score from './Score'
import VSHeader from './VSHeader'
import {useScoresheetTheme} from './scoresheetTheme'

type ScoresheetHeaderProps = {
  sticky: boolean
  onToggleSticky: () => void
}

export default function ScoresheetHeader({
  sticky,
  onToggleSticky,
}: ScoresheetHeaderProps) {
  const theme = useScoresheetTheme()
  const {t} = useTranslation()
  const {state}: any = useMatchContext()
  const matchInfo = state?.matchInfo
  const isTournament = Number(matchInfo?.tournament_id) > 0
  const cupLabel = String(matchInfo?.division_name || '').trim() || t('cup_match')

  function handleToggle() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onToggleSticky()
  }

  return (
    <View
      style={[
        {
          marginHorizontal: 12,
          marginTop: 12,
          marginBottom: 8,
          borderRadius: 18,
        },
        sticky ? {backgroundColor: theme.canvas} : null,
        theme.shadow,
      ]}>
      <View
        style={{
          borderRadius: 18,
          overflow: 'hidden',
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: isTournament
            ? theme.isDark
              ? 'rgba(251,191,36,0.45)'
              : 'rgba(180,83,9,0.35)'
            : theme.cardBorder,
          paddingBottom: 16,
        }}>
        <View style={{flexDirection: 'row', height: 4}}>
          {isTournament ? (
            <View style={{flex: 1, backgroundColor: theme.gold}} />
          ) : (
            <>
              <View style={{flex: 1, backgroundColor: theme.home.accent}} />
              <View style={{flex: 1, backgroundColor: theme.away.accent}} />
            </>
          )}
        </View>
        <View style={{position: 'absolute', top: 10, right: 10, zIndex: 2}}>
          <Pressable
            onPress={handleToggle}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              sticky ? 'Unpin scoresheet header' : 'Pin scoresheet header'
            }
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.faint,
            }}>
            {({pressed}) => (
              <MCI
                name={sticky ? 'pin' : 'pin-off'}
                size={16}
                color={pressed ? theme.win : sticky ? theme.text : theme.muted}
              />
            )}
          </Pressable>
        </View>
        {isTournament ? (
          <View
            style={{
              marginTop: 14,
              marginHorizontal: 12,
              marginBottom: 2,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: theme.isDark
                ? 'rgba(251,191,36,0.14)'
                : 'rgba(245,158,11,0.12)',
              borderWidth: 1,
              borderColor: theme.isDark
                ? 'rgba(251,191,36,0.32)'
                : 'rgba(180,83,9,0.28)',
            }}>
            <MCI name="trophy" size={16} color={theme.gold} />
            <Text
              style={{
                flex: 1,
                color: theme.isDark ? '#FDE68A' : theme.goldInk,
                fontSize: 13,
                fontWeight: '800',
              }}
              numberOfLines={1}>
              {cupLabel}
            </Text>
            <Text
              style={{
                color: theme.isDark ? '#FBBF24' : '#B45309',
                fontSize: 10,
                fontWeight: '800',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
              }}>
              {t('tournament_match')}
            </Text>
          </View>
        ) : null}
        <View style={{paddingTop: isTournament ? 10 : 16}}>
          <VSHeader />
        </View>
        <Score />
        <FirstBreak />
      </View>
    </View>
  )
}
