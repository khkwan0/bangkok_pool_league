import React from 'react'
import {Image, ScrollView, View} from 'react-native'
import {Button, Divider, Text} from 'react-native-paper'
import config from '~/config'
import TwoColumns from '@components/TwoColumns'
import {useNavigation} from '@react-navigation/native'
import LeagueHistory from '@components/LeageHistory'

const Player = ({playerInfo}) => {
  const navigation = useNavigation()
  function HandleStatsPress() {
    navigation.navigate('Player Statistics', {playerInfo: playerInfo})
  }

  if (typeof playerInfo.pic === 'undefined' || !playerInfo.pic) {
    if (playerInfo.gender === 'Female') {
      playerInfo.pic = 'default_female.png'
    } else {
      playerInfo.pic = 'default_male.png'
    }
  }

  return (
    <ScrollView style={{paddingVertical: 20}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 20,
        }}>
        <View style={{flex: 2}}>
          <TwoColumns label="ID">
            <Text variant="bodyLarge">{playerInfo.player_id}</Text>
          </TwoColumns>
          <TwoColumns label="Gender">
            <Text variant="bodyLarge">{playerInfo.gender}</Text>
          </TwoColumns>
          <TwoColumns label="Nickname">
            <Text variant="bodyLarge">{playerInfo.name}</Text>
          </TwoColumns>
          <TwoColumns label="First name">
            <Text variant="bodyLarge">{playerInfo.firstname}</Text>
          </TwoColumns>
          <TwoColumns label="Surname">
            <Text variant="bodyLarge">{playerInfo.lastname}</Text>
          </TwoColumns>
          <TwoColumns label="Nationality">
            <Text variant="bodyLarge">{playerInfo.nationality.en}</Text>
          </TwoColumns>
          <TwoColumns label="Language">
            <Text variant="bodyLarge">{playerInfo.language}</Text>
          </TwoColumns>
        </View>
        <View style={{flex: 1}}>
          <Image
            source={{uri: config.profileUrl + playerInfo.pic}}
            width={100}
            height={100}
            resizeMode="contain"
            style={{borderRadius: 50}}
          />
        </View>
      </View>
      <Divider />
      <View>
        <Button onPress={() => HandleStatsPress()}>Player Statistics</Button>
      </View>
      <Divider />
      <View style={{paddingVertical: 20}}>
        {playerInfo.teams.map((team, idx) => {
          if (idx === 0) {
            return (
              <TwoColumns key={team + idx} label="Teams">
                <Text>{team}</Text>
              </TwoColumns>
            )
          } else {
            return (
              <TwoColumns key={team + idx}>
                <Text>{team}</Text>
              </TwoColumns>
            )
          }
        })}
      </View>
      <Divider />
      <View style={{padding: 20}}>
        <View>
          <Text>LEAGUE HISTORY</Text>
        </View>
        <LeagueHistory playerInfo={playerInfo} />
      </View>
    </ScrollView>
  )
}

export default Player
