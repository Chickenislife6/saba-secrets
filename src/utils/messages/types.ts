export interface ProcessedChatMessage {
  id: string
  recipient: string
  from: string
  timestamp: number
  body: string
}

export type ChatMessage = {
  message: string
  timestamp: number
  sender: string
}
