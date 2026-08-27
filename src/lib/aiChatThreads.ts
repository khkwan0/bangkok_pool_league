export const MEMBER_AI_CHAT_THREADS_PATH = 'ai-agent/chat-threads'
export const ADMIN_AI_CHAT_THREADS_PATH = 'admin/ai/chat-threads'
export const AI_CHAT_THREADS_PATH = MEMBER_AI_CHAT_THREADS_PATH
export const AI_CHAT_LLM_PAIR_LIMIT = 20

export type AiChatTurn = {
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export type AiChatThreadSummary = {
  id: number
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

export type ChatMessageLike = {
  id: string
  message: string
  nickname: string
  playerId: number
  timestamp: number
  isUserMessage?: boolean
}

export function sliceChatHistoryForLlm(
  history: AiChatTurn[],
  pairLimit: number = AI_CHAT_LLM_PAIR_LIMIT,
): AiChatTurn[] {
  const maxMessages = Math.max(0, pairLimit) * 2
  if (history.length <= maxMessages) return history
  return history.slice(-maxMessages)
}

export function healDuplicateTurns<T extends {role: string; content: string}>(
  turns: T[],
): T[] {
  return turns.filter((turn, index) => {
    if (index === 0) return true
    const prev = turns[index - 1]
    return !(prev && prev.role === turn.role && prev.content === turn.content)
  })
}

export function chatMessagesToTurns(
  messages: ChatMessageLike[],
  currentUserId: number,
): AiChatTurn[] {
  return messages
    .filter(item => item.message.trim())
    .map(item => ({
      role: (item.isUserMessage || item.playerId === currentUserId
        ? 'user'
        : 'assistant') as 'user' | 'assistant',
      content: item.message,
      created_at: new Date(
        item.timestamp < 10000000000 ? item.timestamp * 1000 : item.timestamp,
      ).toISOString(),
    }))
}

export function turnsToChatMessages(
  turns: AiChatTurn[],
  currentUserId: number,
  currentNickname: string,
): ChatMessageLike[] {
  return turns.map((turn, index) => {
    const isUserMessage = turn.role === 'user'
    const parsed = turn.created_at ? Date.parse(turn.created_at) : NaN
    return {
      id: `thread_${index}_${turn.created_at ?? index}`,
      message: turn.content,
      nickname: isUserMessage ? currentNickname : 'Response',
      playerId: isUserMessage ? currentUserId : 0,
      timestamp: Number.isNaN(parsed) ? Date.now() : parsed,
      isUserMessage,
    }
  })
}

export function formatThreadTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
