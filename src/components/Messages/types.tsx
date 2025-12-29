export interface Message {
  id: number
  title: string
  message: string
  created_at: string
  read_at: string
  sender_nickname: string
}

export interface MessageCardProps {
  message: Message
  showAll: boolean
}
