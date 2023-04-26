import { bufferToString, stringToBuffer, stringToUtf8 } from '../serialize'
import { importKey } from '../user/user-keys'

export let publicKeys: { [name: string]: string } = {}

export async function encryptWithKey(recipient: string, message: string) {
  if (publicKeys[recipient] === undefined) {
    return null
  }
  const key = publicKeys[recipient] as string
  const pk = await importKey(key, 'encrypt')

  // const encrypted_size = stringToUtf8(message).buffer.byteLength
  // const needed_size = 4 - (encrypted_size % 4)

  // const msg = message.padEnd(needed_size + message.length)
  const chunks: string[] = []
  for (var i = 0, charsLength = message.length; i < charsLength; i += 100) {
    chunks.push(message.substring(i, i + 100))
  }
  console.log(chunks)

  let final_ct = ''
  for (const chunk of chunks) {
    const encryption = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      pk,
      stringToUtf8(chunk).buffer
    )
    console.log(stringToBuffer(bufferToString(encryption)))
    console.log(encryption)
    console.log(bufferToString(encryption).length)

    final_ct = final_ct.concat(bufferToString(encryption))
  }
  console.log(final_ct)
  return final_ct
}

export function addPublicKey(key: string, recipient: string) {
  publicKeys[recipient] = key
  window.localStorage.setItem('publicKeys', JSON.stringify(publicKeys))
}

export function loadPublicKeys() {
  const pks = window.localStorage.getItem('publicKeys')
  if (pks === null) return
  publicKeys = { ...JSON.parse(pks), ...publicKeys }
}
