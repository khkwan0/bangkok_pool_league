import React from 'react'
import {Pressable, Text, View} from '@ybase'
import {useYBase} from '~/lib/hooks'
import {ImageBackground} from 'react-native'

const PlayerStatisticsMenu = props => {
  const {colors} = useYBase()

  return (
    <View flex={1} bgColor={colors.background}>
      <ImageBackground
        source={require('../../../assets/img/bgs/bkkpool_logo.png')}
        style={{flex: 1, width: '100%', height: '100%'}}
        resizeMode="cover">
        <Pressable
          bgColor="#000b"
          borderRadius={0}
          flex={1}
          alignItems="center"
          justifyContent="center"
          onPress={() => props.navigation.navigate('Player Statistics')}>
          <Text bold fontSize="xxl" color={colors.onPrimary}>
            combined
          </Text>
        </Pressable>
      </ImageBackground>
      <ImageBackground
        source={require('../../../assets/img/bgs/nineball.png')}
        style={{flex: 1, width: '100%', height: '100%'}}
        resizeMode="cover">
        <Pressable
          flex={1}
          bgColor="#000d"
          borderRadius={0}
          alignItems="center"
          justifyContent="center"
          onPress={() =>
            props.navigation.navigate('Player Statistics', {gameType: '9b'})
          }>
          <Text bold fontSize="xxl" color={colors.onPrimary}>
            nine_ball 
          </Text>
        </Pressable>
      </ImageBackground>
      <ImageBackground
        source={require('../../../assets/img/bgs/eightball.png')}
        style={{flex: 1, width: '100%', height: '100%'}}
        resizeMode="cover">
        <Pressable
          bgColor="#000d"
          borderRadius={0}
          flex={1}
          alignItems="center"
          justifyContent="center"
          onPress={() =>
            props.navigation.navigate('Player Statistics', {gameType: '8b'})
          }>
          <Text bold fontSize="xxl" color={colors.onPrimary}>
            eight_ball
          </Text>
        </Pressable>
      </ImageBackground>
    </View>
  )
}

export default PlayerStatisticsMenu
