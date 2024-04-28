import React from 'react'
import {FlatList} from 'react-native'
import PlayerCard from '@components/PlayerCard'
import {Button, ScrollView, View} from '@ybase'
import NewPlayerInput from './components/AddNewPlayer'
import {useYBase} from '~/lib/hooks'
import {useTranslation} from 'react-i18next'

const Roster = props => {
  const [showAddNew, setShowAddNew] = React.useState(false)
  const {colors} = useYBase()
  const {t} = useTranslation()

  // this is a "goBack" with params
  function HandleSelect(playerId, newPlayer = false, newToTeam = false) {
    setShowAddNew(false)
    if (
      typeof props?.route?.params?.fromCompleted !== 'undefined' &&
      props.route.params.fromCompleted
    ) {
      props.navigation.navigate('Post Match Screen', {
        player: {
          newToTeam: newToTeam,
          playerId: playerId,
          frameInfo: props.route.params.frameInfo,
          newPlayer: newPlayer,
        },
        fromCompleted: true,
      })
    } else {
      props.navigation.navigate('Match Screen', {
        player: {
          newToTeam: newToTeam,
          playerId: playerId,
          frameInfo: props.route.params.frameInfo,
          newPlayer: newPlayer,
        },
      })
    }
  }

  return (
    <View flex={1} bgColor={colors.background}>
      {showAddNew && (
        <ScrollView
          contentContainerStyle={{
            backgroundColor: colors.background,
            flexGrow: 1,
            paddingHorizontal: 20,
          }}>
          <Button onPress={() => setShowAddNew(false)}>{t('cancel')}</Button>
          <NewPlayerInput
            frameInfo={props.route.params.frameInfo}
            handleSelect={HandleSelect}
          />
        </ScrollView>
      )}
      {!showAddNew && (
        <FlatList
          ItemSeparatorComponent={<View style={{marginVertical: 5}} />}
          ListHeaderComponent={
            <View px={20} bgColor={colors.background} py={10}>
              <Button variant="outline" onPress={() => setShowAddNew(true)}>
                {t('add_new_player')}
              </Button>
            </View>
          }
          stickyHeaderIndices={[0]}
          keyExtractor={(item, index) => 'playercard' + index}
          data={props.route.params.teams[
            props.route.params.frameInfo.teamId
          ].sort((a, b) => (a.nickname > b.nickname ? 1 : -1))}
          renderItem={({item, index}) => {
            // check to see if how many times a player can play in a section (aka mfpp)
            let i = 0
            let count = 0
            let disabled = false
            const playerId = item.playerId
            while (i < props.route.params.frames.length) {
              const frame = props.route.params.frames[i]
              if (
                frame.type !== 'section' &&
                frame.section === props.route.params.section
              ) {
                if (
                  frame.homePlayerIds.includes(playerId) ||
                  frame.awayPlayerIds.includes(playerId)
                ) {
                  count++
                }
              }
              i++
            }
            if (count >= props.route.params.mfpp) {
              disabled = true
            }

            // if doubles, make sure same person can't be chosen
            const frame =
              props.route.params.frames[props.route.params.frameInfo.frameIdx]
            if (
              frame.homePlayerIds.includes(playerId) ||
              frame.awayPlayerIds.includes(playerId)
            ) {
              disabled = true
            }

            return (
              <PlayerCard
                idx={index}
                disabled={disabled}
                player={item}
                handleSelect={HandleSelect}
                frameInfo={props.route.params.frameInfo}
                abbrevLast
                abbrevFirst
              />
            )
          }}
        />
      )}
    </View>
  )
}

export default Roster
