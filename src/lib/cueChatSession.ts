export type CueChatSessionMessage = {
  id: string
  message: string
  nickname: string
  playerId: number
  timestamp: number
  rawData?: unknown
  isUserMessage?: boolean
}

const sessions = new Map<number, CueChatSessionMessage[]>()

export function getCueChatSession(userId: number): CueChatSessionMessage[] {
  return sessions.get(userId) ?? []
}

export function setCueChatSession(
  userId: number,
  messages: CueChatSessionMessage[],
) {
  sessions.set(userId, messages)
}

export function clearCueChatSession(userId?: number) {
  if (typeof userId === 'number') {
    sessions.delete(userId)
    return
  }
  sessions.clear()
}
