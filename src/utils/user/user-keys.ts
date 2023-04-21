import { KeyHelper, KeyPairType, PreKeyType } from '@privacyresearch/libsignal-protocol-typescript'
import {
  getKeyPair,
  getSerializedKeyPair,
  storeKeyPair,
  storeKeyPairs,
  storeSerializedKeyPair,
} from '../localstorage/keys'
import { stringToBase64, utf8ToString } from '../serialize'
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

export async function testIdentityKey() {
  let key: KeyPairType<JsonWebKey> = getSerializedKeyPair(
    'secretSenderKey'
  ) as KeyPairType<JsonWebKey>

  const msg = stringToBase64('test')

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

  const encrypted = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pub, msg)
  const decrypted = await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, priv, encrypted)

  console.log('successfully decrypted to: ' + utf8ToString(decrypted))
}

export async function createNewOneTimePreKeys(num: number) {
  const identityKeyPair = getKeyPair('identityKey')!

  const keys: PreKeyType[] = []
  for (let i = 0; i < num; i++) {
    const baseKeyId = crypto.getRandomValues(new Uint16Array(2))
    const preKey = await KeyHelper.generatePreKey(baseKeyId[0]!)
    storeKeyPairs('oneTimePreKeys', baseKeyId[1]!, preKey.keyPair)

    // might need this? not sure yet
    // const signedPreKeyId = Math.floor(100000 * Math.random());
    // const signedPreKey = await KeyHelper.generateSignedPreKey(identityKeyPair, signedPreKeyId)
    // storeKeyPairs("signedPreKeyId", signedPreKeyId, signedPreKey.keyPair)

    const publicPreKey: PreKeyType = {
      keyId: preKey.keyId,
      publicKey: preKey.keyPair.pubKey,
    }
    keys.push(publicPreKey)
  }
  return keys
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
