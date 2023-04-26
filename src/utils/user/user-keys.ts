import { KeyHelper, KeyPairType, PreKeyType } from '@privacyresearch/libsignal-protocol-typescript'
import {
  getSerializedKeyPair,
  storeKeyPair,
  storeKeyPairs,
  storeSerializedKeyPair,
} from '../localstorage/keys'
import { bufferToString, stringToBuffer, stringToUtf8, utf8ToString } from '../serialize'
import type { PublicUserKeys, UserKeys } from './types'

/**
 * Creates a new set of user keys via libsignal's KeyHelper
 */
export async function createNewUserKeys() {
  window.localStorage.clear()

  const identityKeyPair = await KeyHelper.generateIdentityKeyPair()

  const keyIds = crypto.getRandomValues(new Uint16Array(2))

  const signedPreKey = await KeyHelper.generateSignedPreKey(identityKeyPair, keyIds[0]!)

  const oneTimePreKey = await KeyHelper.generatePreKey(keyIds[1]!)

  // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey, first example
  let keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  )

  const secretSenderKey = {
    pubKey: await window.crypto.subtle.exportKey('jwk', keyPair.publicKey),
    privKey: await window.crypto.subtle.exportKey('jwk', keyPair.privateKey),
  }

  console.log(secretSenderKey)
  storeSerializedKeyPair('secretSenderKey', secretSenderKey)
  storeKeyPair('identityKey', identityKeyPair)
  storeKeyPairs('signedPreKey', signedPreKey.keyId, signedPreKey.keyPair)
  storeKeyPairs('oneTimePreKeys', oneTimePreKey.keyId, oneTimePreKey.keyPair)

  return {
    identityKeyPair,
    signedPreKey,
    oneTimePreKey,
    secretSenderKey,
  } satisfies UserKeys
}

export async function importKey(key: string, type: 'decrypt' | 'encrypt'): Promise<CryptoKey> {
  const jwk = JSON.parse(key)
  const pub = await window.crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    [type]
  )
  return pub
}

export async function testIdentityKey() {
  let key: KeyPairType<JsonWebKey> = getSerializedKeyPair(
    'secretSenderKey'
  ) as KeyPairType<JsonWebKey>

  const m =
    '{test}}}aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  const mes = window.localStorage.getItem('TEST')!
  const needed_pad = 4 - (m.length % 4)
  const msg = m.padEnd(needed_pad + m.length)
  const message = stringToUtf8(m).buffer
  const test = bufferToString(message)
  console.log(test)
  const test2 = stringToBuffer(test)

  const pub = await window.crypto.subtle.importKey(
    'jwk',
    key.pubKey,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt']
  )
  const priv = await window.crypto.subtle.importKey(
    'jwk',
    key.privKey,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['decrypt']
  )
  console.log(message)
  const encrypted = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pub, message)
  const web_compatable = bufferToString(encrypted)
  const after_web = stringToBuffer(web_compatable)
  const decrypted = await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, priv, after_web)
  console.log(decrypted)
  console.log('successfully decrypted to: ' + utf8ToString(decrypted))
}

export async function createNewOneTimePreKeys(num: number) {
  // const identityKeyPair = getKeyPair('identityKey')!
  const baseKeys = crypto.getRandomValues(new Uint16Array(num))

  const oneTimePreKeys = await Promise.all([...baseKeys].map(KeyHelper.generatePreKey))

  for (const key of oneTimePreKeys) {
    storeKeyPairs('oneTimePreKeys', key.keyId, key.keyPair)
  }
  return oneTimePreKeys.map(
    ({ keyId, keyPair }) =>
      ({
        keyId,
        publicKey: keyPair.pubKey,
      } satisfies PreKeyType<ArrayBuffer>)
  )
}

/**
 * Extracts the public keys from a UserKeys object for DB entry
 */
export function extractPublicUserKeys({
  identityKeyPair,
  signedPreKey,
  oneTimePreKey,
  secretSenderKey,
}: UserKeys): PublicUserKeys {
  return {
    identityPublicKey: identityKeyPair.pubKey,
    signedPreKey: {
      keyId: signedPreKey.keyId,
      publicKey: signedPreKey.keyPair.pubKey,
      signature: signedPreKey.signature,
    },
    oneTimePreKey: {
      keyId: oneTimePreKey.keyId,
      publicKey: oneTimePreKey.keyPair.pubKey,
    },
    secretSenderKey: secretSenderKey.pubKey,
  }
}
