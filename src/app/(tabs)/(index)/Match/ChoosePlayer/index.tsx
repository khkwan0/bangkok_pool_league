import {useLocalSearchParams} from 'expo-router'
import {useMatchContext} from '@/context/MatchContext'
import {FlatList, Pressable} from 'react-native'
import PlayerCard from '@/components/PlayerCard'
import React from 'react'
import {useNavigation} from '@react-navigation/native'
import {t} from 'i18next'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {Link, router} from 'expo-router'
import {useThemeColor} from '@/hooks/useThemeColor'

export default function ChoosePlayer(props: any) {
  const {params} = useLocalSearchParams()
  const {state}: any = useMatchContext()
  const navigation = useNavigation()
  console.log(params)
  const {teamId, side, frameIndex, frameNumber, frameType, slot} = JSON.parse(
    params as string,
  )

  React.useEffect(() => {
    navigation.setOptions({title: t('roster')})
  }, [])

  const _team = state.teams[teamId as string]
  const team = Object.keys(_team)
    .map((key: string) => _team[key])
    .sort((a: any, b: any) => a.nickname.localeCompare(b.nickname))

  const currentSection = state.matchInfo.initialFrames[frameIndex].section
  const sectionFrames = []
  state.matchInfo.initialFrames.forEach((frame, index) => {
    if (frame.section === currentSection && frame.frameNumber > 0) {
      frame.frameIndex = index
      sectionFrames.push(frame)
    }
  })

  return (
    <FlatList
      className="px-2"
      style={{backgroundColor: useThemeColor({}, 'background')}}
      ListHeaderComponent={
        <View className="mt-4">
          <Pressable className="bg-blue-200 dark:bg-blue-700 py-5 border rounded">
            <Link
              href={{
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
              }}>
              <Text className="text-center">add_new_player</Text>
            </Link>
          </Pressable>
        </View>
      }
      data={team}
      renderItem={({item, index}) => {
        let disabled = false
        let count = 0
        sectionFrames.forEach(frame => {
          if (
            state.frameData[frame.frameIndex].awayPlayerIds.includes(
              item.playerId,
            ) ||
            state.frameData[frame.frameIndex].homePlayerIds.includes(
              item.playerId,
            )
          ) {
            count++
          }
        })
        const mfpp = state.matchInfo.initialFrames[frameIndex].mfpp
        if (count >= mfpp) {
          disabled = true
        }
        return (
          <PlayerCard
            player={item}
            side={side as string}
            frameIndex={frameIndex}
            frameNumber={frameNumber}
            frameType={frameType as string}
            slot={slot}
            disabled={disabled}
          />
        )
      }}
    />
  )
}
