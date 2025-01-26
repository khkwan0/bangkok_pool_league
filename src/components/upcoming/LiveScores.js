import React from 'react'
import {AppState, useWindowDimensions, FlatList, Pressable} from 'react-native'
import {ThemedView as View} from '@/components/ThemedView'
import {ThemedText as Text} from '@/components/ThemedText'
import {useLeague} from '@/hooks'
import {useTheme} from '@react-navigation/native'
import Row from '@/components/Row'

const Score = props => {
  const {width} = useWindowDimensions()
  const {colors, dark} = useTheme()

  return (
    <View
      className="m-1"
      style={{width: width, borderWidth: 1, borderColor: colors.border}}>
      <Pressable
        className="py-5 mx-2"
        onPress={() => props.handlePress(props.item.id)}>
        <Row alignItems="center" justifyContent="center" space={5}>
          <View flex={3} alignItems="flex-end">
            <Text type="subtitle" style={{textAlign: 'right'}}>
              {props.item.home_name}
            </Text>
          </View>
          <View flex={2} alignItems="center">
            <Text type="subtitle">
              {props.item.homeScore} vs {props.item.awayScore}
            </Text>
          </View>
          <View flex={3} alignItems="flex-start">
            <Text type="subtitle" style={{textAlign: 'left'}}>
              {props.item.away_name}
            </Text>
          </View>
        </Row>
      </Pressable>
    </View>
  )
}

const LiveScores = props => {
  const [scores, setScores] = React.useState([])
  const league = useLeague()

  const flatlist = React.useRef(null)
  const timer = React.useRef(null)
  const currentSlide = React.useRef(0)

  async function GetLiveScores() {
    try {
      const res = await league.GetLiveScores()
      if (typeof res.status !== 'undefined' && res.status === 'ok') {
        setScores(res.data)
      }
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    GetLiveScores()
  }, [])

  async function AdvanceTicker() {
    currentSlide.current = currentSlide.current + 1
    if (currentSlide.current > scores.length - 1) {
      await GetLiveScores()
      currentSlide.current = 0
    }

    if (flatlist.current) {
      flatlist.current.scrollToIndex({
        index: currentSlide.current,
        animated: true,
        viewPosition: 0.5,
      })
    }
  }

  React.useEffect(() => {
    const subscribe = AppState.addEventListener('change', nextAppState => {
      if (nextAppState !== 'active') {
        clearInterval(timer.current)
      } else {
        timer.current = setInterval(() => AdvanceTicker(), 4000)
      }
    })
    return () => {
      subscribe.remove()
    }
  })

  React.useEffect(() => {
    if (scores.length > 0) {
      timer.current = setInterval(() => AdvanceTicker(), 4000)
    } else {
      clearInterval(timer.current)
    }
    return () => clearInterval(timer.current)
  }, [scores])

  if (scores.length > 0) {
    return (
      <FlatList
        horizontal
        numColumns={1}
        data={scores}
        showsHorizontalScrollIndicator={false}
        renderItem={({item, index}) => (
          <Score item={item} idx={index} handlePress={props.handlePress} />
        )}
        ref={flatlist}
        pagingEnabled
      />
    )
  } else {
    return null
  }
}

export default LiveScores
