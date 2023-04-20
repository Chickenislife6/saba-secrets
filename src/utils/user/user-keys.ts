import { KeyHelper, PreKeyType } from '@privacyresearch/libsignal-protocol-typescript';
import { getKeyPair, storeKeyPair, storeKeyPairs } from '../localstorage/keys';
import type { PublicUserKeys, UserKeys } from './types';

/**
 * Creates a new set of user keys via libsignal's KeyHelper
 */
export async function createNewUserKeys() {
  window.localStorage.clear();

  const identityKeyPair = await KeyHelper.generateIdentityKeyPair()

  const keyIds = crypto.getRandomValues(new Uint16Array(2))

  const signedPreKey = await KeyHelper.generateSignedPreKey(identityKeyPair, keyIds[0]!)

  const oneTimePreKey = await KeyHelper.generatePreKey(keyIds[1]!)

  storeKeyPair("identityKey", identityKeyPair);
  storeKeyPairs("signedPreKey", signedPreKey.keyId, signedPreKey.keyPair)
  storeKeyPairs("oneTimePreKeys", oneTimePreKey.keyId, oneTimePreKey.keyPair)

  return {
    identityKeyPair,
    signedPreKey,
    oneTimePreKey,
  } satisfies UserKeys
}

export async function createNewOneTimePreKeys(num: number) {
  const identityKeyPair = getKeyPair('identityKey')!;

  const keys: PreKeyType[] = [];
  for (let i = 0; i < num; i++) {
    const baseKeyId = crypto.getRandomValues(new Uint16Array(2));
    const preKey = await KeyHelper.generatePreKey(baseKeyId[0]!)
    storeKeyPairs("oneTimePreKeys", baseKeyId[1]!, preKey.keyPair)

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
  return keys;
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
