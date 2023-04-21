// Temporary file, used to test helper functions using the Crypto API and others
import { KeyPairType } from '@privacyresearch/libsignal-protocol-typescript'
import { bufferToString, stringToBuffer } from '~/utils/serialize'

/*
  Note: converting to base64 string results in smaller strings (256 // 6) + 1 = 44
    vs comparable hex conversion (256 // 4) = 64. This makes it more effective for 
    storing in DBs and other places where space is limited or parsing expensive.

    The way to do this with base 16 looks like:
    const hash = Array.from(new Uint8Array(sha256buffer))
      .map(item => item.toString(16).padStart(2, '0')) 
      .join('')
    Which is ultimately less efficient due to JS' memory allocation for arrays
 */
export async function hash(str: string): Promise<string> {
  // Generate length 32 random bytes of 8 bits each
  const sha256Buffer = await digestSHA256(str)
  // Convert bytes to base64 string (6 bits per char)
  return bufferToString(sha256Buffer)
}

function digestSHA256(str: string): Promise<ArrayBuffer> {
  if (!isSecureContext) {
    throw new Error('This function is only available in a secure context')
  }

  const data = new TextEncoder().encode(str)
  return crypto.subtle.digest('SHA-256', data)
}



export function generateKeyPair(): KeyPairType<string> {
  const { generateKeyPairSync } = require('crypto');
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
  return { pubKey: publicKey, privKey: privateKey }
}
/*
  Alternative for string hashing to number
  See explanation here: https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
  https://github.com/bryc/code/tree/master/jshash

  Note parsing for numbers in a DB is significantly faster than strings (100x faster),
  however, this algorithm has not been widely tested by the community.
  Author seems to be widely knowledgable in the field of hashing however,
  and has been fairly active in open source. https://gist.github.com/iperelivskiy/4110988

  Author also recommends using a 128-bit MumurHash3, his js implementation is available here:
  https://github.com/bryc/code/blob/master/jshash/hashes/murmurhash3_128.js

  cyrb53 (c) 2018 bryc (github.com/bryc)
  License: Public domain. Attribution appreciated.
  A fast and simple 53-bit string hash function with decent collision resistance.
  Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
*/
export function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

/*
  DeriveKey using Web Crypto - note salt needs to be randomly generated
  Based off MDN examples here: 
  https://github.com/mdn/dom-examples/blob/main/web-crypto/derive-key/pbkdf2.js
  https://udn.realityripple.com/docs/Web/API/SubtleCrypto/deriveKey#:~:text=SubtleCrypto.deriveKey%20%28%29%201%20Syntax%20const%20result%20%3D%20crypto,compatibility%20Full%20support%20Partial%20support%20No%20support%20

  Note the recommendation to use PBKDF2 for smaller passwords (e.g., usernames and passcodes)
  Deriving key using this method is 2.5-5x slower than using SHA256 with 1000 iterations, but is on the order of a few milliseconds
  whereas SHA256 consistently performs at under 1ms per hash.

  At a higher level of iterations (recommended is 100,000), performance drops to up to >100-150x slower than 
  SHA256 hash (~0.1s). This is without having encrypted the data, which would add only marginal time, but increased complexity

  Weakness in this method is that this introduces some variable length in encrypted data, which can be resolved with padding. 
  Probably won't use this for usernames, but may be useful for files and localstorage
*/

export async function deriveKey(
  baseKey: string, // base key would be something like a password
  iterations?: number
): Promise<{ derivedKey: CryptoKey; salt: Uint8Array }> {
  if (!isSecureContext) {
    throw new Error('This function is only available in a secure context')
  }

  const keyMaterial = await getKeyMaterial(baseKey)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const derivedKey = await generateKey(keyMaterial, salt, iterations)

  return {
    derivedKey,
    salt,
  }
}

async function getKeyMaterial(baseKey: string): Promise<CryptoKey> {
  const format: Exclude<KeyFormat, 'jwk'> = 'raw'

  const keyBuffer: BufferSource = new TextEncoder().encode(baseKey)

  const algorithm:
    | AlgorithmIdentifier
    | RsaHashedImportParams
    | EcKeyImportParams
    | HmacImportParams
    | AesKeyAlgorithm = { name: 'PBKDF2' }

  const extractable = false

  const keyUsages: KeyUsage[] = ['deriveBits', 'deriveKey']

  return crypto.subtle.importKey(format, keyBuffer, algorithm, extractable, keyUsages)
}

async function generateKey(
  keyMaterial: CryptoKey,
  salt: Uint8Array,
  iterations = 10e5
): Promise<CryptoKey> {
  const params: Pbkdf2Params = {
    name: 'PBKDF2',
    salt,
    iterations,
    hash: 'SHA-256',
  }

  const derivedKeyType:
    | AlgorithmIdentifier
    | AesDerivedKeyParams
    | HmacImportParams
    | HkdfParams
    | Pbkdf2Params = {
    name: 'AES-GCM',
    length: 256,
  }

  const extractable = true

  const keyUsages: KeyUsage[] = ['encrypt', 'decrypt']

  return crypto.subtle.deriveKey(params, keyMaterial, derivedKeyType, extractable, keyUsages)
}

/*
  Encryption / decryption using Web Crypto PBKDF2 and AES-GCM
*/
export async function encrypt(
  str: string,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: Uint8Array }> {
  if (!isSecureContext) {
    throw new Error('This function is only available in a secure context')
  }

  const data = new TextEncoder().encode(str)

  const iv = crypto.getRandomValues(new Uint8Array(12))

  const algorithm:
    | AlgorithmIdentifier
    | RsaOaepParams
    | AesCtrParams
    | AesCbcParams
    | AesGcmParams = {
    name: 'AES-GCM',
    iv,
  }

  const ciphertext = await crypto.subtle.encrypt(algorithm, key, data)
  return { ciphertext: bufferToString(ciphertext), iv } // iv is needed for decryption
}

export async function decrypt(ciphertext: string, key: CryptoKey, iv: Uint8Array): Promise<string> {
  if (!isSecureContext) {
    throw new Error('This function is only available in a secure context')
  }

  const data = stringToBuffer(ciphertext)

  const algorithm:
    | AlgorithmIdentifier
    | RsaOaepParams
    | AesCtrParams
    | AesCbcParams
    | AesGcmParams = {
    name: 'AES-GCM',
    iv,
  }

  const plaintext = await crypto.subtle.decrypt(algorithm, key, data)
  return new TextDecoder().decode(plaintext)
}
