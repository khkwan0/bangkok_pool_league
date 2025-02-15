import Row from '@/components/Row'
import {ThemedText as Text} from '@/components/ThemedText'
import {useMatchContext} from '@/context/MatchContext'
import {Link} from 'expo-router'
import {Platform, Pressable} from 'react-native'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'

interface PlayerProps {
  teamId: number | string
  side: string
  frameIndex: number
  frameNumber: number
  frameType?: string
  playerIds: number[]
}

export default function Player({
  teamId,
  side,
  frameIndex,
  frameNumber,
  frameType,
  playerIds,
}: PlayerProps) {
  const {state}: any = useMatchContext()
  const playerPlusIconSize = 20
  const {home_team_id: homeTeamId, away_team_id: awayTeamId} = state.matchInfo
  const textColor = 'rgb(107, 33, 168)'
  return (
    <>
      <Link
        href={{
          pathname: '/Match/ChoosePlayer',
          params: {
            params: JSON.stringify({
              teamId: teamId,
              side: side,
              frameIndex: frameIndex,
              frameNumber: frameNumber,
              frameType: frameType,
              slot: 0,
            }),
          },
        }}
        asChild>
        <Pressable>
          <Row alignItems="center" justifyContent="center" style={{gap: 10}}>
            {typeof playerIds[0] !== 'undefined' &&
              state.teams[teamId]?.[playerIds[0]]?.nickname && (
                <>
                  <Text type="subtitle" style={{color: textColor}}>
                    {state?.teams?.[teamId]?.[playerIds[0]]?.nickname ?? ''}
                  </Text>
                </>
              )}
            {(typeof playerIds[0] === 'undefined' ||
              !state?.teams?.[teamId]?.[playerIds[0]]?.nickname) && (
              <>
                <MCI
                  name="plus-circle"
                  size={playerPlusIconSize}
                  color={textColor}
                />
                <Text type="subtitle" style={{color: textColor}}>
                  Player
                </Text>
              </>
            )}
          </Row>
        </Pressable>
      </Link>
      {(frameType === '8d' || frameType === '9d') && (
        <Link
          href={{
            pathname: '/Match/ChoosePlayer',
            params: {
              params: JSON.stringify({
                teamId: teamId,
                side: side,
                frameIndex: frameIndex,
                frameNumber: frameNumber,
                frameType: frameType,
                slot: 1,
              }),
            },
          }}
          asChild>
          <Pressable className="pt-6">
            <Row alignItems="center" justifyContent="center" style={{gap: 10}}>
              {typeof playerIds[1] !== 'undefined' &&
                state?.teams?.[teamId]?.[playerIds[1]]?.nickname && (
                  <>
                    <Text type="subtitle" style={{color: textColor}}>
                      {state?.teams?.[teamId]?.[playerIds[1]]?.nickname ?? ''}
                    </Text>
                  </>
                )}
              {(typeof playerIds[1] === 'undefined' ||
                !state?.teams?.[teamId]?.[playerIds[1]]?.nickname) && (
                <>
                  <MCI
                    name="plus-circle"
                    size={playerPlusIconSize}
                    color={textColor}
                  />
                  <Text type="subtitle" style={{color: textColor}}>
                    Player
                  </Text>
                </>
              )}
            </Row>
          </Pressable>
        </Link>
      )}
      {teamId === homeTeamId &&
        state.firstBreak === homeTeamId &&
        state.frameData[frameIndex].frameNumber % 2 === 1 && (
          <Text className="text-center" style={{color: textColor}}>
            break
          </Text>
        )}
      {teamId === homeTeamId &&
        state.firstBreak === awayTeamId &&
        state.frameData[frameIndex].frameNumber % 2 === 0 && (
          <Text className="text-center" style={{color: textColor}}>
            break
          </Text>
        )}
      {teamId === awayTeamId &&
        state.firstBreak === awayTeamId &&
        state.frameData[frameIndex].frameNumber % 2 === 1 && (
          <Text className="text-center" style={{color: textColor}}>
            break
          </Text>
        )}
      {teamId === awayTeamId &&
        state.firstBreak === homeTeamId &&
        state.frameData[frameIndex].frameNumber % 2 === 0 && (
          <Text className="text-center" style={{color: textColor}}>
            break
          </Text>
        )}
    </>
  )
}
