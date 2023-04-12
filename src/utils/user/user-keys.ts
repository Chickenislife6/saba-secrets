import { KeyHelper } from '@privacyresearch/libsignal-protocol-typescript'
import type { UserKeys, PublicUserKeys } from './types'

/**
 * Creates a new set of user keys via libsignal's KeyHelper
 */
export async function createNewUserKeys() {
  const identityKeyPair = await KeyHelper.generateIdentityKeyPair()

  const keyIds = crypto.getRandomValues(new Uint32Array(2))

  const signedPreKey = await KeyHelper.generateSignedPreKey(identityKeyPair, keyIds[0]!)

  const oneTimePreKey = await KeyHelper.generatePreKey(keyIds[1]!)

  return {
    identityKeyPair,
    signedPreKey,
    oneTimePreKey,
  } satisfies UserKeys
}

/**
 * Extracts the public keys from a UserKeys object for DB entry
 */
export function extractPublicUserKeys({
  identityKeyPair,
  signedPreKey,
  oneTimePreKey,
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
  }
}
