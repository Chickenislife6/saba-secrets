import {
  DeviceType,
  SessionBuilder,
  SignalProtocolAddress,
} from '@privacyresearch/libsignal-protocol-typescript'
import { getKeyPair, getKeyPairs } from '../localstorage/keys'
import { stringToBuffer } from '../serialize'
import { SignalProtocolStore } from './signalStore'

export const store = new SignalProtocolStore()

// must be called after a user is created
export function loadIdentity() {
  const identityKeyPair = getKeyPair('identityKey')
  store.put('identityKey', identityKeyPair)

  const preKeys = getKeyPairs('oneTimePreKeys')!
  for (let key in preKeys) {
    store.storePreKey(`${key}`, preKeys[key]!)
  }

  const signedPreKeys = getKeyPairs('signedPreKey')!
  for (let key in signedPreKeys) {
    store.storeSignedPreKey(key, signedPreKeys[key]!)
  }
}

// gets recipient.1 from store, then stores in localstorage
export async function storeSession(recipient: string) {
  const session = await store.loadSession(recipient + '.1')
  if (session !== undefined) {
    window.localStorage.setItem(recipient + 'session', session)
  } else {
    throw Error('failed to store session!')
  }
}

// mutably adds the session of recipient to store, if exists
export const loadSession = (recipient: string) => {
  const session = window.localStorage.getItem(recipient + 'session')
  if (session !== null) {
    store.storeSession(recipient + '.1', session)
    return { success: true }
  }
  return { success: false }
}

export async function loadSessionIfUndefined(recipient: string) {
  if ((await store.loadSession(recipient + '.1')) === undefined) {
    return loadSession(recipient)
  }
  return { success: false }
}

export async function addSession(data: DeviceType<string>, recipient: string) {
  if ((await store.loadSession(recipient + '.1')) !== undefined) {
    return
  }
  const recipientAddress = new SignalProtocolAddress(recipient, 1)
  const sessionBuilder = new SessionBuilder(store, recipientAddress)

  const bundle: DeviceType = {
    identityKey: stringToBuffer(data.identityKey),
    signedPreKey: {
      ...data.signedPreKey,
      signature: stringToBuffer(data.signedPreKey.signature),
      publicKey: stringToBuffer(data.signedPreKey.publicKey),
    },
    preKey: {
      ...data.preKey!,
      publicKey: stringToBuffer(data.preKey!.publicKey),
    },
  }
  await sessionBuilder.processPreKey(bundle)
}
