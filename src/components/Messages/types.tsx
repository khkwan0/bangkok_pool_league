export interface Message {
  id: number
  title: string
  message: string
  created_at: string
  read_at: string
  sender_nickname: string
  receiver_nickname: string
  from_player_id: number
  to_player_id: number
  root_id: number
  reply_to: number
}

export interface MessageCardProps {
  message: Message
  showAll: boolean
}
