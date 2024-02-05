import React from 'react'
import {AppState, useWindowDimensions, FlatList} from 'react-native'
import {Pressable, Row, Text, View} from '@ybase'
import {useLeague, useYBase} from '~/lib/hooks'

const Score = props => {
  const {width} = useWindowDimensions()
  return (
    <View w={width} my={10}>
      <Pressable
        borderWidth={1}
        mx={10}
        py={10}
        onPress={() => props.handlePress(props.item.id)}>
        <Row alignItems="center" justifyContent="center" space={5}>
          <View flex={3} alignItems="flex-end">
            <Text fontSize="xl" textAlign="right">
              {props.item.home_name}
            </Text>
          </View>
          <View flex={2} alignItems="center">
            <Text bold fontSize="xl">
              {props.item.homeScore} vs {props.item.awayScore}
            </Text>
          </View>
          <View flex={3} alignItems="flex-start">
            <Text fontSize="xl" textAlign="left">
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
