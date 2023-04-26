import { ChatMessage } from '../messages/types'

export function storeMessages(session: { [recipient: string]: ChatMessage[] }, timestamp: number) {
  window.localStorage.setItem('session', JSON.stringify(session))
  window.localStorage.setItem('timestamp', JSON.stringify(timestamp))
}

export function restoreMessages() {
  const localSession = localStorage.getItem('session')
  const session = localSession ? JSON.parse(localSession) : {}

  const localTimestamp = localStorage.getItem('timestamp')
  const timestamp = localTimestamp ? JSON.parse(localTimestamp) : 0

  return { session, timestamp }
}
