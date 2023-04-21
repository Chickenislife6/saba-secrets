import { BehaviorSubject } from 'rxjs'
import { restoreMessages, storeMessages } from '../localstorage/messages'
import { ChatMessage } from './types'

export const session: { [recipient: string]: ChatMessage[] } = {}
export const sessionSubject = new BehaviorSubject<ChatMessage[]>([])
export let timestamp: number = 0

export const addMessage = (recipient: string, message: ChatMessage) => {
  if (message === undefined) return

  const li = session[recipient]
  if (li === undefined) {
    session[recipient] = [message]
  } else {
    li.push(message)
    li.sort((a, b) => {
      return a.timestamp - b.timestamp
    })
  }

  storeMessages(session, message.timestamp)

  // guaranteed to be non-null because single-threaded
  sessionSubject.next(session[recipient]!)
  return session[recipient]
}

export const addMessages = (recipient: string, messages: ChatMessage[]) => {
  for (const message of messages) {
    addMessage(recipient, message)
  }
}

export const getMessages = (recipient: string) => {
  if (session[recipient] === undefined) {
    return []
  }
  return session[recipient]
}

export const reloadMessages = (recipient: string) => {
  const { session: ls, timestamp: ts } = restoreMessages()
  Object.assign(session, ls)
  timestamp = ts
  sessionSubject.next(session[recipient] ?? [])
}
