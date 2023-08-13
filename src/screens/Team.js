import React from 'react'
import {Image, ScrollView, View} from 'react-native'
import {Text, TouchableRipple} from 'react-native-paper'
import TwoColumns from '~/components/TwoColumns'
import {useNavigation} from '@react-navigation/native'
import config from '~/config'

const Team = props => {
  const team = props.team
  const navigation = useNavigation()
  return (
    <ScrollView style={{paddingBottom: 30}}>
      <View style={{alignItems: 'center'}}>
        <Image
          source={{uri: config.logoUrl + team.venue_logo}}
          width={100}
          height={100}
          resizeMode="contain"
        />
      </View>
      <View style={{marginTop: 20}}>
        <TwoColumns label="name">
          <Text variant="titleLarge">{team.name}</Text>
        </TwoColumns>
      </View>
      <View style={{marginTop: 20}}>
        {team.captains.map((captain, idx) => (
          <TwoColumns key={'captain' + idx} label={idx === 0 ? 'captain' : ''}>
            <TouchableRipple
              onPress={() =>
                navigation.navigate('Player', {
                  playerId: captain.id,
                })
              }>
              <View style={{flexDirection: 'row', gap: 5}}>
                <Text>{captain.flag}</Text>
                <Text variant="bodyLarge">{captain.nickname}</Text>
                <Text variant="bodyLarge">
                  ({captain.firstname} {captain.lastname})
                </Text>
              </View>
            </TouchableRipple>
          </TwoColumns>
        ))}
        {team.assistants.map((assistant, idx) => (
          <TwoColumns
            key={'assistant' + idx}
            label={idx === 0 ? 'assistants' : ''}>
            <TouchableRipple
              onPress={() =>
                navigation.navigate('Player', {
                  playerId: assistant.id,
                })
              }>
              <View style={{flexDirection: 'row', gap: 5}}>
                <Text>{assistant.flag}</Text>
                <Text variant="bodyLarge">{assistant.nickname}</Text>
                <Text variant="bodyLarge">
                  ({assistant.firstname} {assistant.lastname})
                </Text>
              </View>
            </TouchableRipple>
          </TwoColumns>
        ))}
      </View>
      <View style={{marginTop: 20}}>
        {team.players.map((player, idx) => (
          <TwoColumns key={'player' + idx} label={idx === 0 ? 'players' : ''}>
            <TouchableRipple
              onPress={() =>
                navigation.navigate('Player', {
                  playerId: player.id,
                })
              }>
              <View style={{flexDirection: 'row', gap: 5}}>
                <Text>{player.flag}</Text>
                <Text variant="bodyLarge">{player.nickname}</Text>
                <Text variant="bodyLarge">
                  ({player.firstname} {player.lastname})
                </Text>
              </View>
            </TouchableRipple>
          </TwoColumns>
        ))}
      </View>
    </ScrollView>
  )
}

export default Team
