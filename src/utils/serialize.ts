import type {
  KeyPairType,
  PreKeyType,
  SignedPublicPreKeyType,
} from '@privacyresearch/libsignal-protocol-typescript'
import * as base64 from 'base64-js'
import type { PublicUserKeys } from '~/utils/user/types'

// Note we use base64 over TextEncoder/TextDeocder due to base64's
// safer encoding of 0's (not string terminating)

// User Key Bundles, to store in DB
export function serializePublicUserKeys({
  identityPublicKey,
  signedPreKey,
  oneTimePreKey,
  secretSenderKey
}: PublicUserKeys<ArrayBuffer>): PublicUserKeys<string> {
  return {
    identityPublicKey: bufferToString(identityPublicKey),
    signedPreKey: serializeSignedPreKey(signedPreKey),
    oneTimePreKey: serializePreKey(oneTimePreKey),
    secretSenderKey: JSON.stringify(secretSenderKey)
  }
}

export function deserializePublicUserKeys({
  identityPublicKey,
  signedPreKey,
  oneTimePreKey,
  secretSenderKey
}: PublicUserKeys<string>): PublicUserKeys<ArrayBuffer> {
  return {
    identityPublicKey: stringToBuffer(identityPublicKey),
    signedPreKey: deserializeSignedPreKey(signedPreKey),
    oneTimePreKey: deserializePreKey(oneTimePreKey),
    secretSenderKey: JSON.parse(secretSenderKey) as JsonWebKey
  }
}

// PreKeys
// We don't know if these two are used yet
// export function serializePreKeyArray(keys: PreKeyType<ArrayBuffer>[]): PreKeyType<string>[] {
//   return keys.map(serializePreKey)
// }

// export function deserializePreKeyArray(keys: PreKeyType<string>[]): PreKeyType<ArrayBuffer>[] {
//   return keys.map(deserializePreKey)
// }

export function serializeSignedPreKey(
  key: SignedPublicPreKeyType<ArrayBuffer>
): SignedPublicPreKeyType<string> {
  return {
    ...serializePreKey(key),
    signature: bufferToString(key.signature),
  }
}

export function deserializeSignedPreKey(
  key: SignedPublicPreKeyType<string>
): SignedPublicPreKeyType<ArrayBuffer> {
  return {
    ...deserializePreKey(key),
    signature: stringToBuffer(key.signature),
  }
}

export function serializePreKey(key: PreKeyType<ArrayBuffer>): PreKeyType<string> {
  return {
    keyId: key.keyId,
    publicKey: bufferToString(key.publicKey),
  }
}

export function deserializePreKey(key: PreKeyType<string>): PreKeyType<ArrayBuffer> {
  return {
    keyId: key.keyId,
    publicKey: stringToBuffer(key.publicKey),
  }
}

// Key Pairs
export function serializeKeyPair(key: KeyPairType<ArrayBuffer>): KeyPairType<string> {
  return {
    pubKey: bufferToString(key.pubKey),
    privKey: bufferToString(key.privKey),
  }
}

export function deserializeKeyPair(key: KeyPairType<string>): KeyPairType<ArrayBuffer> {
  return {
    pubKey: stringToBuffer(key.pubKey),
    privKey: stringToBuffer(key.privKey),
  }
}

// Buffer/String conversions
export function bufferToString(buffer: ArrayBuffer): string {
  return base64.fromByteArray(new Uint8Array(buffer))
}

export function stringToBuffer(str: string): ArrayBuffer {
  return base64.toByteArray(str).buffer
}
