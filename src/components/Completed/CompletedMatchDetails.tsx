import More from '@/components/Match/components/More'
import {
  useScoresheetTheme,
  type SidePalette,
} from '@/components/Match/components/scoresheetTheme'
import {useMatch} from '@/hooks'
import {formatBangkokDateMed} from '@/lib/bangkokTime'
import {
  loadCompletedHeaderSticky,
  saveCompletedHeaderSticky,
} from '@/lib/completedHeaderSticky'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import * as Haptics from 'expo-haptics'
import {useNavigation, useRouter} from 'expo-router'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {FlatList, Image, Pressable, Text, View} from 'react-native'

type Frame = {
  frameId: number
  /** Scoresheet frame number. Section breaks use -1. */
  frameNo?: number
  section?: boolean
  sectionNumber?: number
  homePlayers: {nickName: string; playerId: number}[]
  awayPlayers: {nickName: string; playerId: number}[]
  /** 1 home won, 0 away won, null not played. */
  homeWin: number | null
  goldenBreak?: boolean
  homeScore?: number
  awayScore?: number
  valuePerLeg?: number
}

type MatchDetails = Frame[]

function frameNumberLabel(frame: Frame, playableOrdinal: number) {
  const n = Number(frame.frameNo)
  if (Number.isFinite(n) && n > 0) return n
  return playableOrdinal
}

type MatchMetadata = {
  matchDate?: string
  date?: string
  home_team_id: number
  away_team_id: number
  home_team_name: string
  away_team_name: string
  home_team_short_name?: string
  away_team_short_name?: string
  home_frames: number
  away_frames: number
  first_break_home_team?: number
  home_logo?: string | null
  away_logo?: string | null
  status_id?: number
}

function CompletedSide({
  players,
  won,
  dim,
  pressed,
  onPressIn,
  onPressOut,
  align,
  palette,
  winColor,
  winInk,
  goldenBreak,
  goldenLabel,
  onOpenPlayer,
}: {
  players: Frame['homePlayers']
  won: boolean
  dim: boolean
  pressed: boolean
  onPressIn: () => void
  onPressOut: () => void
  align: 'left' | 'right'
  palette: SidePalette
  winColor: string
  winInk: string
  goldenBreak: boolean
  goldenLabel: string
  onOpenPlayer: (playerId: number) => void
}) {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: won ? palette.panelWinner : palette.panel,
        borderWidth: won ? 1.5 : 1,
        borderColor: won
          ? goldenBreak
            ? winColor
            : palette.accent
          : palette.border,
        opacity: dim && !won ? 0.72 : 1,
        justifyContent: 'space-between',
      }}>
      <View
        style={{
          alignItems: align === 'left' ? 'flex-start' : 'flex-end',
          gap: 4,
        }}>
        {players.map((player, idx) => (
          <Pressable
            key={`${player.playerId}-${idx}`}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={() => onOpenPlayer(player.playerId)}
            style={{opacity: pressed ? 0.55 : 1}}>
            <Text
              style={{
                color: palette.ink,
                fontSize: 16,
                fontWeight: '800',
                textAlign: align === 'left' ? 'left' : 'right',
              }}>
              {player.nickName}
            </Text>
          </Pressable>
        ))}
      </View>
      {won ? (
        <View
          style={{
            marginTop: 8,
            alignSelf: 'stretch',
            minHeight: goldenBreak ? 40 : 32,
            borderRadius: 10,
            backgroundColor: winColor,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: goldenBreak ? 4 : 0,
          }}>
          <MCI
            name={goldenBreak ? 'star' : 'check'}
            size={goldenBreak ? 16 : 18}
            color={winInk}
          />
          {goldenBreak ? (
            <Text
              numberOfLines={1}
              style={{
                marginTop: 1,
                color: winInk,
                fontSize: 11,
                fontWeight: '800',
              }}>
              {goldenLabel}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}

function FrameRow({
  frame,
  playableOrdinal,
}: {
  frame: Frame
  playableOrdinal: number
}) {
  const {t} = useTranslation()
  const router = useRouter()
  const theme = useScoresheetTheme()
  const [homePressed, setHomePressed] = React.useState(false)
  const [awayPressed, setAwayPressed] = React.useState(false)
  const homeWon = frame.homeWin === 1
  const awayWon = frame.homeWin === 0
  const goldenBreak = Boolean(frame.goldenBreak)

  if (frame.section) {
    const sectionNo = frame.sectionNumber ?? frame.frameNo
    return (
      <View
        style={{
          marginTop: 6,
          marginBottom: 2,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 14,
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.cardBorder,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text style={{color: theme.muted, fontSize: 13, fontWeight: '700'}}>
          {t('section')}
          {sectionNo != null && Number(sectionNo) > 0 ? ` ${sectionNo}` : ''}
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <Text
            style={{
              color: theme.home.accent,
              fontSize: 18,
              fontWeight: '800',
              fontVariant: ['tabular-nums'],
            }}>
            {Number(frame.homeScore ?? 0)}
          </Text>
          <Text style={{color: theme.muted, fontSize: 14}}>–</Text>
          <Text
            style={{
              color: theme.away.accent,
              fontSize: 18,
              fontWeight: '800',
              fontVariant: ['tabular-nums'],
            }}>
            {Number(frame.awayScore ?? 0)}
          </Text>
        </View>
      </View>
    )
  }

  function openPlayer(playerId: number) {
    router.replace({
      pathname: './Player',
      params: {
        params: JSON.stringify({playerId}),
      },
    })
  }

  const winColor = goldenBreak ? theme.gold : theme.win
  const winInk = goldenBreak ? theme.goldInk : '#FFFFFF'

  return (
    <View
      style={[
        {
          borderRadius: 18,
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: goldenBreak ? theme.gold : theme.cardBorder,
          paddingBottom: 10,
        },
        theme.shadow,
      ]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingTop: 12,
          paddingBottom: 8,
          gap: 8,
        }}>
        <Text
          style={{
            color: goldenBreak ? theme.goldInk : theme.muted,
            fontSize: 12,
            fontWeight: '800',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
          }}>
          {t('frame')} {frameNumberLabel(frame, playableOrdinal)}
        </Text>
        {goldenBreak ? (
          <View
            style={{
              borderRadius: 999,
              backgroundColor: theme.gold,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}>
            <Text
              style={{
                color: theme.goldInk,
                fontSize: 10,
                fontWeight: '800',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}>
              {t('golden_break_action')}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={{flexDirection: 'row', gap: 8, paddingHorizontal: 10}}>
        <CompletedSide
          players={frame.homePlayers}
          won={homeWon}
          dim={homeWon || awayWon}
          pressed={homePressed}
          onPressIn={() => setHomePressed(true)}
          onPressOut={() => setHomePressed(false)}
          align="left"
          palette={theme.home}
          winColor={winColor}
          winInk={winInk}
          goldenBreak={goldenBreak && homeWon}
          goldenLabel={t('golden_break_action')}
          onOpenPlayer={openPlayer}
        />
        <CompletedSide
          players={frame.awayPlayers}
          won={awayWon}
          dim={homeWon || awayWon}
          pressed={awayPressed}
          onPressIn={() => setAwayPressed(true)}
          onPressOut={() => setAwayPressed(false)}
          align="right"
          palette={theme.away}
          winColor={winColor}
          winInk={winInk}
          goldenBreak={goldenBreak && awayWon}
          goldenLabel={t('golden_break_action')}
          onOpenPlayer={openPlayer}
        />
      </View>
    </View>
  )
}

export default function CompletedMatchDetails({
  matchId,
}: {
  matchId?: number | null
}) {
  const matchHook = useMatch()
  const [matchDetails, setMatchDetails] = React.useState<MatchDetails | null>(
    null,
  )
  const [loading, setLoading] = React.useState(true)
  const navigation = useNavigation()
  const [matchMetadata, setMatchMetadata] =
    React.useState<MatchMetadata | null>(null)
  const [homePressed, setHomePressed] = React.useState(false)
  const [awayPressed, setAwayPressed] = React.useState(false)
  const router = useRouter()
  const theme = useScoresheetTheme()
  const {t} = useTranslation()
  const [headerSticky, setHeaderSticky] = React.useState(false)
  const validMatchId = (() => {
    const id = Number(matchId)
    return Number.isFinite(id) && id > 0 ? id : null
  })()

  React.useEffect(() => {
    let cancelled = false
    loadCompletedHeaderSticky().then(sticky => {
      if (!cancelled) setHeaderSticky(sticky)
    })
    return () => {
      cancelled = true
    }
  }, [])

  function toggleHeaderSticky() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setHeaderSticky(prev => {
      const next = !prev
      void saveCompletedHeaderSticky(next)
      return next
    })
  }

  React.useEffect(() => {
    let cancelled = false

    async function sleep(ms: number) {
      await new Promise(resolve => setTimeout(resolve, ms))
    }

    async function getMatchDetails(id: number) {
      try {
        let details: MatchDetails | null = null
        let meta: MatchMetadata | null = null

        // Finalize writes frames then updates match scores; retry briefly so
        // opening a just-completed match does not flash empty 0–0 data.
        for (let attempt = 0; attempt < 8; attempt++) {
          const res = await matchHook.GetMatchDetails(id)
          const res2 = await matchHook.GetMatchMetadata(id)
          details = Array.isArray(res?.data) ? res.data : null
          meta = res2?.data ?? null
          const framesReady = Array.isArray(details) && details.length > 0
          const scoreReady =
            Number(meta?.home_frames ?? 0) + Number(meta?.away_frames ?? 0) > 0
          const statusReady = Number(meta?.status_id ?? 0) === 3
          if (framesReady && (scoreReady || statusReady || attempt === 7)) {
            break
          }
          await sleep(400 + attempt * 200)
          if (cancelled) return
        }

        if (cancelled) return
        setMatchDetails(details)
        setMatchMetadata(meta)
      } catch (error) {
        console.error('Failed to fetch match details:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (validMatchId) {
      getMatchDetails(validMatchId)
    } else {
      setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [validMatchId])

  React.useEffect(() => {
    navigation.setOptions({
      title: validMatchId ? `Match #${validMatchId}` : 'Match',
    })
  }, [validMatchId, navigation])

  const playableOrdinals = React.useMemo(() => {
    let ordinal = 0
    return (matchDetails ?? []).map(frame =>
      frame.section ? 0 : ++ordinal,
    )
  }, [matchDetails])

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.canvas,
        }}>
        <Text style={{color: theme.muted}}>Loading...</Text>
      </View>
    )
  }

  if (!matchDetails) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.canvas,
        }}>
        <Text style={{color: theme.text}}>Match not found</Text>
      </View>
    )
  }

  const homeFrames = matchMetadata?.home_frames ?? 0
  const awayFrames = matchMetadata?.away_frames ?? 0
  const tied = homeFrames === awayFrames
  const total = homeFrames + awayFrames
  const matchDate =
    matchMetadata?.matchDate || matchMetadata?.date || undefined
  const homeName =
    matchMetadata?.home_team_short_name || matchMetadata?.home_team_name
  const awayName =
    matchMetadata?.away_team_short_name || matchMetadata?.away_team_name

  const header = (
    <>
      <View
        style={[
          {
            marginHorizontal: headerSticky ? 12 : 0,
            marginTop: 12,
            marginBottom: 8,
            borderRadius: 18,
          },
          headerSticky ? {backgroundColor: theme.canvas} : null,
          theme.shadow,
        ]}>
        <View
          style={{
            borderRadius: 18,
            overflow: 'hidden',
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            paddingBottom: 16,
          }}>
          <View style={{flexDirection: 'row', height: 4}}>
            <View style={{flex: 1, backgroundColor: theme.home.accent}} />
            <View style={{flex: 1, backgroundColor: theme.away.accent}} />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: 14,
              gap: 8,
            }}>
            <Text style={{color: theme.muted, fontSize: 13, fontWeight: '700'}}>
              Match #{validMatchId}
            </Text>
            <View style={{flex: 1}} />
            {typeof matchDate === 'string' && (
              <Text style={{color: theme.muted, fontSize: 13, fontWeight: '600'}}>
                {formatBangkokDateMed(matchDate)}
              </Text>
            )}
            <Pressable
              onPress={toggleHeaderSticky}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={
                headerSticky ? 'Unpin match header' : 'Pin match header'
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
                  name={headerSticky ? 'pin' : 'pin-off'}
                  size={16}
                  color={
                    pressed ? theme.win : headerSticky ? theme.text : theme.muted
                  }
                />
              )}
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              paddingHorizontal: 12,
              paddingTop: 14,
            }}>
            <Pressable
              style={{
                flex: 1,
                alignItems: 'center',
                opacity: homePressed ? 0.55 : 1,
              }}
              onPressIn={() => setHomePressed(true)}
              onPressOut={() => setHomePressed(false)}
              onPress={() => {
                router.push({
                  pathname: '/Completed/Match/Team',
                  params: {
                    params: JSON.stringify({
                      teamId: matchMetadata?.home_team_id,
                    }),
                  },
                })
              }}>
              {matchMetadata?.home_logo ? (
                <Image
                  source={{uri: matchMetadata.home_logo}}
                  resizeMode="contain"
                  style={{width: 26, height: 26, marginBottom: 6}}
                />
              ) : null}
              <Text
                numberOfLines={2}
                style={{
                  textAlign: 'center',
                  color: theme.text,
                  fontSize: 18,
                  fontWeight: '800',
                }}>
                {homeName}
              </Text>
              <View
                style={{
                  marginTop: 8,
                  width: 36,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: theme.home.accent,
                }}
              />
            </Pressable>
            <View style={{width: 44, alignItems: 'center', paddingTop: 4}}>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: theme.faint,
                }}>
                <Text
                  style={{
                    color: theme.muted,
                    fontSize: 11,
                    fontWeight: '800',
                    letterSpacing: 1,
                  }}>
                  VS
                </Text>
              </View>
            </View>
            <Pressable
              style={{
                flex: 1,
                alignItems: 'center',
                opacity: awayPressed ? 0.55 : 1,
              }}
              onPressIn={() => setAwayPressed(true)}
              onPressOut={() => setAwayPressed(false)}
              onPress={() => {
                router.push({
                  pathname: '/Completed/Match/Team',
                  params: {
                    params: JSON.stringify({
                      teamId: matchMetadata?.away_team_id,
                    }),
                  },
                })
              }}>
              {matchMetadata?.away_logo ? (
                <Image
                  source={{uri: matchMetadata.away_logo}}
                  resizeMode="contain"
                  style={{width: 26, height: 26, marginBottom: 6}}
                />
              ) : null}
              <Text
                numberOfLines={2}
                style={{
                  textAlign: 'center',
                  color: theme.text,
                  fontSize: 18,
                  fontWeight: '800',
                }}>
                {awayName}
              </Text>
              <View
                style={{
                  marginTop: 8,
                  width: 36,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: theme.away.accent,
                }}
              />
            </Pressable>
          </View>
          <View style={{paddingHorizontal: 16, paddingTop: 12}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 44,
                  lineHeight: 48,
                  fontWeight: '800',
                  fontVariant: ['tabular-nums'],
                  color:
                    tied || homeFrames > awayFrames
                      ? theme.home.accent
                      : theme.muted,
                }}>
                {homeFrames}
              </Text>
              <Text
                style={{
                  width: 28,
                  textAlign: 'center',
                  color: theme.muted,
                  fontSize: 22,
                  fontWeight: '600',
                }}>
                –
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 44,
                  lineHeight: 48,
                  fontWeight: '800',
                  fontVariant: ['tabular-nums'],
                  color:
                    tied || awayFrames > homeFrames
                      ? theme.away.accent
                      : theme.muted,
                }}>
                {awayFrames}
              </Text>
            </View>
            <View
              style={{
                marginTop: 8,
                height: 6,
                borderRadius: 999,
                overflow: 'hidden',
                flexDirection: 'row',
                backgroundColor: theme.faint,
              }}>
              {total === 0 ? (
                <View style={{flex: 1}} />
              ) : (
                <>
                  {homeFrames > 0 && (
                    <View
                      style={{
                        flex: homeFrames,
                        backgroundColor: theme.home.accent,
                      }}
                    />
                  )}
                  {awayFrames > 0 && (
                    <View
                      style={{
                        flex: awayFrames,
                        backgroundColor: theme.away.accent,
                      }}
                    />
                  )}
                </>
              )}
            </View>
          </View>
          {(matchMetadata?.first_break_home_team === 1 ||
            matchMetadata?.first_break_home_team === 0) && (
            <Text
              style={{
                textAlign: 'center',
                marginTop: 12,
                color: theme.muted,
                fontSize: 12,
                fontWeight: '700',
              }}>
              {t('first_break')}:{' '}
              {matchMetadata?.first_break_home_team === 1 ? homeName : awayName}
            </Text>
          )}
        </View>
      </View>

      {validMatchId ? <More matchId={validMatchId} /> : null}
    </>
  )

  return (
    <View style={{flex: 1, backgroundColor: theme.canvas}}>
      {headerSticky ? header : null}
      <FlatList
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 24, paddingHorizontal: 12}}
        data={matchDetails}
        ListHeaderComponent={headerSticky ? undefined : header}
        renderItem={({item, index}) => (
          <FrameRow
            frame={item}
            playableOrdinal={playableOrdinals[index] ?? index + 1}
          />
        )}
        ItemSeparatorComponent={() => <View style={{height: 8}} />}
        keyExtractor={(item, index) =>
          item.section
            ? `section-${item.sectionNumber ?? item.frameId}-${index}`
            : String(item.frameId)
        }
      />
    </View>
  )
}
