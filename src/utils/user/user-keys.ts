import { KeyHelper } from '@privacyresearch/libsignal-protocol-typescript'
import type { UserKeys, PublicUserKeys } from './types'

/**
 * Creates a new set of user keys via libsignal's KeyHelper
 */
export async function createNewUserKeys() {
  // Registration ID is a number identifies the user, can be same as userId
  // A DB-based registration/user id is better, as it can enforce the constraint
  // const registrationId = KeyHelper.generateRegistrationId()

  const identityKeyPair = await KeyHelper.generateIdentityKeyPair()

  // TODO: make key ids collision resistant
  const signedPreKeyId = Math.floor(10e8 * Math.random())
  const signedPreKey = await KeyHelper.generateSignedPreKey(identityKeyPair, signedPreKeyId)

  const oneTimePreKeyId = Math.floor(10e8 * Math.random())
  const oneTimePreKey = await KeyHelper.generatePreKey(oneTimePreKeyId)

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
