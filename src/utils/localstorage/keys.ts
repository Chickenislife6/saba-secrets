import { KeyPairType } from '@privacyresearch/libsignal-protocol-typescript'
import * as base64 from 'base64-js'
import { deserializeKeyPair, serializeKeyPair, stringToBuffer } from '../serialize'

type StorageOptionsSerialize = 'identityKey' | 'oneTimePreKeys' | 'signedPreKey'

export const storeKeyPair = (name: StorageOptionsSerialize, KeyPair: KeyPairType) => {
  const privstr = base64.fromByteArray(new Uint8Array(KeyPair.privKey))
  window.localStorage.setItem(name + 'priv', privstr)
  const pubstr = base64.fromByteArray(new Uint8Array(KeyPair.pubKey))
  window.localStorage.setItem(name + 'pub', pubstr)
}

type StorageOptionsSerialized = 'secretSenderKey'
// should only be called with objects that can be default serialized
export const storeSerializedKeyPair = (
  name: StorageOptionsSerialized,
  KeyPair: KeyPairType<object>
) => {
  window.localStorage.setItem(name + 'priv', JSON.stringify(KeyPair.privKey))
  window.localStorage.setItem(name + 'pub', JSON.stringify(KeyPair.pubKey))
}

export const getSerializedKeyPair = (name: StorageOptionsSerialized): KeyPairType<object> => {
  const privKey = JSON.parse(window.localStorage.getItem(name + 'priv')!)
  const pubKey = JSON.parse(window.localStorage.getItem(name + 'pub')!)
  return { privKey, pubKey }
}

export const getKeyPair = (name: StorageOptionsSerialize): KeyPairType | undefined => {
  const pub = window.localStorage.getItem(name + 'pub')
  const priv = window.localStorage.getItem(name + 'priv')
  if (pub == null || priv == null) {
    return
  }

  const pubKey = stringToBuffer(pub)
  const privKey = stringToBuffer(priv)

  return { privKey, pubKey }
}

export const storeKeyPairs = (name: StorageOptionsSerialize, id: number, keyPair: KeyPairType) => {
  let values: { [id: number]: KeyPairType<string> } = {}

  const old_values = window.localStorage.getItem(name)
  if (old_values !== null) {
    values = JSON.parse(old_values)
  }
  values[id] = serializeKeyPair(keyPair)

  window.localStorage.setItem(name, JSON.stringify(values))
}

export const getKeyPairs = (name: StorageOptionsSerialize) => {
  const localstorage = window.localStorage.getItem(name)
  if (localstorage === null) {
    return
  }
  const keys: { [id: number]: KeyPairType<string> } = JSON.parse(localstorage)
  const keyMap: { [id: number]: KeyPairType } = {}
  for (let key in keys) {
    keyMap[key] = deserializeKeyPair(keys[key]!)
  }
  return keyMap
}
