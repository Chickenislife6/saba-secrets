import {
  SessionCipher,
  SignalProtocolAddress,
} from '@privacyresearch/libsignal-protocol-typescript'
import { v4 as uuid } from 'uuid'
import { SignalProtocolStore } from '../identity/signalStore'
import { store } from '../identity/state'
import { stringToUtf8, utf8ToString } from '../serialize'
import { ChatMessage, ProcessedChatMessage } from './types'

// must call loadSessionIfUndefined(to), and storeSession(to) before and after call
export async function encryptMessage(
  to: string,
  from: string,
  message: string,
  store: SignalProtocolStore
) {
  const address = new SignalProtocolAddress(to, 1)
  const cipher = new SessionCipher(store, address)

  const cm: ProcessedChatMessage = {
    id: uuid(),
    recipient: to,
    from: from,
    timestamp: Date.now(),
    body: message,
  }
  const messageBuffer = stringToUtf8(JSON.stringify(cm)).buffer
  const signalMessage = await cipher.encrypt(messageBuffer)

  return signalMessage
}

// minimum required message for decoding, as long as message satisfies this it can be decoded
export type MinMessage = {
  type: number
  message: string
  id: number
}

// must call loadSessionIfUndefined(to), and storeSession(to) before and after call
export async function getMessagesAndDecrypt(
  encodedmessages: MinMessage[],
  address: string,
  store: SignalProtocolStore
) {
  const cipher = new SessionCipher(store, new SignalProtocolAddress(address, 1))

  const decodedmessages: ProcessedChatMessage[] = []
  for (const message of encodedmessages) {
    const decryptMessageFn =
      message.type === 3 ? cipher.decryptPreKeyWhisperMessage : cipher.decryptWhisperMessage

    const messageJson = JSON.parse(message!.message)
    const plaintextBytes = await decryptMessageFn(messageJson, 'binary')

    const plaintext = utf8ToString(new Uint8Array(plaintextBytes))
    let cm = JSON.parse(plaintext) as ProcessedChatMessage
    decodedmessages.push(cm)
  }

  // sorting is not needed as long as you sort later
  // decodedmessages.sort((a, b) => { return a.timestamp - b.timestamp });
  const orderedmessages: ChatMessage[] = decodedmessages.map(a => {
    return { message: a.body, sender: a.from, timestamp: a.timestamp }
  })
  return orderedmessages
}

export const sortMessages = (messages: ChatMessage[]) => {
  messages.sort((a, b) => a.timestamp - b.timestamp)
  return messages
}

export async function decryptMessage(message: { body: string; type: number }, address: string) {
  const cipher = new SessionCipher(store, new SignalProtocolAddress(address, 1))
  let plaintextBytes
  if (message.type === 3) {
    plaintextBytes = await cipher.decryptPreKeyWhisperMessage(message.body, 'binary')
  } else {
    plaintextBytes = await cipher.decryptWhisperMessage(message.body, 'binary')
  }
  const plaintext = utf8ToString(new Uint8Array(plaintextBytes))
  let cm = JSON.parse(plaintext) as ProcessedChatMessage
  return cm
}
