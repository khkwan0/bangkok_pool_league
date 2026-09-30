import {useLocalSearchParams, router} from 'expo-router'
import {useMatchContext} from '@/context/MatchContext'
import {FlatList, Pressable, useColorScheme, View} from 'react-native'
import PlayerCard from '@/components/PlayerCard'
import React from 'react'
import {useNavigation} from 'expo-router/react-navigation'
import {useTranslation} from 'react-i18next'
import {ThemedView} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {useThemeColor} from '@/hooks/useThemeColor'
import {MaterialCommunityIcons} from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

type RosterPlayer = {
  id?: number
  playerId: number
  nickname: string
  firstname?: string
  lastname?: string
  firstName?: string
  lastName?: string
  profile_picture?: string
  name?: string
}

type RosterHeaderProps = {
  sticky: boolean
  onToggleSticky: () => void
  sideLabel: string
  frameNumber: number
  frameLabel: string
  frameMfpp: number
  availableCount: number
  onAddPlayer: () => void
}

function RosterHeader({
  sticky,
  onToggleSticky,
  sideLabel,
  frameNumber,
  frameLabel,
  frameMfpp,
  availableCount,
  onAddPlayer,
}: RosterHeaderProps) {
  const {t} = useTranslation()
  const colorScheme = useColorScheme()
  const bgColor = useThemeColor({}, 'background')
  const isDark = colorScheme === 'dark'

  function handleToggle() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onToggleSticky()
  }

  return (
    <View
      style={[
        {paddingHorizontal: 12, paddingTop: 16, paddingBottom: 8},
        sticky ? {backgroundColor: bgColor} : null,
      ]}>
      <View className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 p-4 mb-3">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 pr-3">
            <Text type="defaultSemiBold" className="mb-0.5">
              team_roster
            </Text>
            <Text className="opacity-60 text-sm">
              <>{`${sideLabel} · ${t('frame')} ${frameNumber}`}</>
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-3 py-1.5">
              <Text className="text-sm text-blue-700 dark:text-blue-300">
                <>{`${availableCount} ${t('available')}`}</>
              </Text>
            </View>
            <Pressable
              onPress={handleToggle}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={
                sticky ? 'Unpin roster header' : 'Pin roster header'
              }
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDark
                  ? 'rgba(148,163,184,0.16)'
                  : 'rgba(15,23,42,0.06)',
              }}>
              {({pressed}) => (
                <MaterialCommunityIcons
                  name={sticky ? 'pin' : 'pin-off'}
                  size={16}
                  color={
                    pressed
                      ? '#22c55e'
                      : sticky
                        ? isDark
                          ? '#E2E8F0'
                          : '#0F172A'
                        : isDark
                          ? '#94A3B8'
                          : '#64748B'
                  }
                />
              )}
            </Pressable>
          </View>
        </View>

        <View className="flex-row gap-2">
          <View className="flex-1 rounded-xl bg-indigo-600 dark:bg-indigo-500 px-3 py-3 items-center justify-center">
            <Text
              className="text-xs font-semibold tracking-wide mb-0.5"
              style={{color: '#E0E7FF'}}>
              <>
                {t('frame_type', {defaultValue: 'Frame type'}).toUpperCase()}
              </>
            </Text>
            <Text
              type="defaultSemiBold"
              className="text-center"
              style={{color: '#FFFFFF', fontSize: 18}}>
              <>{frameLabel}</>
            </Text>
          </View>
          <View className="flex-1 rounded-xl bg-amber-500 dark:bg-amber-500 px-3 py-3 items-center justify-center">
            <Text
              className="text-xs font-semibold tracking-wide mb-0.5"
              style={{color: '#FFFBEB'}}>
              <>
                {t('max_per_section', {
                  defaultValue: 'Max per section',
                }).toUpperCase()}
              </>
            </Text>
            <Text
              type="defaultSemiBold"
              className="text-center"
              style={{color: '#FFFFFF', fontSize: 22}}>
              <>{String(frameMfpp)}</>
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={onAddPlayer}
        className="flex-row items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 mb-2 active:bg-blue-700">
        <MaterialCommunityIcons name="account-plus" size={22} color="#fff" />
        <Text className="text-white text-center font-semibold">
          add_new_player
        </Text>
      </Pressable>
      <Text className="text-center opacity-50 text-xs mb-1 px-2">
        search_league_to_add
      </Text>
    </View>
  )
}

export default function ChoosePlayer() {
  const {params} = useLocalSearchParams()
  const {state}: any = useMatchContext()
  const navigation = useNavigation()
  const {t} = useTranslation()
  const bgColor = useThemeColor({}, 'background')
  const [headerSticky, setHeaderSticky] = React.useState(true)

  const {teamId, side, frameIndex, frameNumber, frameType, slot} = JSON.parse(
    params as string,
  )

  React.useEffect(() => {
    navigation.setOptions({title: t('roster')})
  }, [])

  const _team = state.teams[teamId as string] ?? {}
  const team: RosterPlayer[] = Object.keys(_team)
    .map((key: string) => _team[key])
    .sort((a: RosterPlayer, b: RosterPlayer) =>
      (a.nickname || '').localeCompare(b.nickname || ''),
    )

  const currentSection = state.matchInfo.initialFrames[frameIndex].section
  const sectionFrames: Array<{frameIndex: number; frameNumber: number}> = []
  state.matchInfo.initialFrames.forEach((frame: any, index: number) => {
    if (frame.section === currentSection && frame.frameNumber > 0) {
      sectionFrames.push({...frame, frameIndex: index})
    }
  })

  const frameMfpp = state.matchInfo.initialFrames[frameIndex].mfpp

  function getPlayCount(playerId: number) {
    let count = 0
    sectionFrames.forEach(frame => {
      if (
        state.frameData[frame.frameIndex].awayPlayerIds.includes(playerId) ||
        state.frameData[frame.frameIndex].homePlayerIds.includes(playerId)
      ) {
        count++
      }
    })
    return count
  }

  function isDisabled(player: RosterPlayer) {
    const playerId = player.playerId ?? player.id
    if (playerId == null) return true
    const count = getPlayCount(playerId)
    return (
      count >= frameMfpp ||
      state.frameData[frameIndex].homePlayerIds.includes(playerId) ||
      state.frameData[frameIndex].awayPlayerIds.includes(playerId)
    )
  }

  function getDisabledReason(player: RosterPlayer): string | null {
    const playerId = player.playerId ?? player.id
    if (playerId == null) return null
    if (
      state.frameData[frameIndex].homePlayerIds.includes(playerId) ||
      state.frameData[frameIndex].awayPlayerIds.includes(playerId)
    ) {
      return 'already_in_frame'
    }
    if (getPlayCount(playerId) >= frameMfpp) {
      return 'max_plays_reached'
    }
    return null
  }

  const availableCount = team.filter(p => !isDisabled(p)).length

  function HandleChoosePlayer() {
    router.push({
      pathname: '/Match/ChoosePlayer/AddPlayer',
      params: {
        params: JSON.stringify({
          frameIndex,
          slot,
          side,
          frameNumber,
          frameType,
        }),
      },
    })
  }

  const sideLabel = side === 'home' ? t('home') : t('away')
  const frameLabel =
    frameType === 'doubles' || frameType === 'd'
      ? t('doubles')
      : frameType === 'singles' || frameType === 's'
        ? t('singles')
        : String(frameType ?? '')

  const header = (
    <RosterHeader
      sticky={headerSticky}
      onToggleSticky={() => setHeaderSticky(value => !value)}
      sideLabel={sideLabel}
      frameNumber={frameNumber}
      frameLabel={frameLabel}
      frameMfpp={frameMfpp}
      availableCount={availableCount}
      onAddPlayer={HandleChoosePlayer}
    />
  )

  return (
    <ThemedView className="flex-1" style={{backgroundColor: bgColor}}>
      {headerSticky ? header : null}
      <FlatList
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 28}}
        ListHeaderComponent={headerSticky ? null : header}
        data={team}
        keyExtractor={(item, index) =>
          String(item.playerId ?? item.id ?? index)
        }
        ListEmptyComponent={
          <View className="items-center py-10 px-4">
            <MaterialCommunityIcons
              name="account-off-outline"
              size={40}
              color="#9ca3af"
            />
            <Text className="text-center mt-3 opacity-60">
              no_players_found
            </Text>
          </View>
        }
        renderItem={({item, index}) => {
          const disabled = isDisabled(item)
          return (
            <View style={{paddingHorizontal: 12}}>
              <PlayerCard
                player={item}
                side={side as string}
                frameIndex={frameIndex}
                frameNumber={frameNumber}
                frameType={frameType as string}
                slot={slot}
                disabled={disabled}
                disabledReason={getDisabledReason(item)}
                mfpp={frameMfpp}
                accentIndex={index}
              />
            </View>
          )
        }}
      />
    </ThemedView>
  )
}
