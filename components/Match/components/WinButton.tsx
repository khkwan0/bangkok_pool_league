import {Pressable, useColorScheme} from 'react-native'
import {ThemedText as Text} from '@/components/ThemedText'
import {useMatchContext} from '@/context/MatchContext'
import MCI from '@expo/vector-icons/MaterialCommunityIcons'
import ConfirmDialog from '@/components/ConfirmDialog'
import * as React from 'react'

interface WinButtonProps {
  winner: number
  HandleWin: Function
  teamId?: number | string
  side: string
}
export default function WinButton({
  winner,
  HandleWin,
  teamId,
  side,
}: WinButtonProps) {
  const theme = useColorScheme()
  const borderColor = theme === 'dark' ? '#aaa' : '#222'
  const [showConfirm, setShowConfirm] = React.useState(false)


  return (
    <>
      {showConfirm && (
        <ConfirmDialog onConfirm={() => {HandleWin(side); setShowConfirm(false)}} onCancel={() => setShowConfirm(false)} isVisible={showConfirm} title="Confirm Winner Change" message="Are you sure you want to change the winner of this frame?" />
      )}
      {winner === teamId && (
        <Pressable className="p-2" onPress={() => setShowConfirm(true)}>
          <MCI name="check" color="green" size={30} />
        </Pressable>
      )}
      {winner !== teamId && !winner && (
        <Pressable
          className="p-2 border rounded-xl"
          style={{borderColor: borderColor}}
          onPress={() => HandleWin(side)}>
          <Text type="subtitle">win</Text>
        </Pressable>
      )}
      {winner !== teamId && winner !== 0 && (
        <Pressable className="p-2" onPress={() => setShowConfirm(true)}>
          <MCI name="close-circle-outline" color="red" size={30} />
        </Pressable>
      )}
    </>
  )
}

