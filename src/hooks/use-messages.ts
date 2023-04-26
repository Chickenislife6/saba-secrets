import { KeyPairType, MessageType } from '@privacyresearch/libsignal-protocol-typescript'
import { api } from '~/utils/api'
import { loadIdentity, loadSession, storeSession } from '~/utils/identity/state'
import { getSerializedKeyPair } from '~/utils/localstorage/keys'
import { decryptMessage } from '~/utils/messages/crypto'
import { addMessage, reloadMessages } from '~/utils/messages/state'
import { stringToBuffer, utf8ToString } from '~/utils/serialize'
import { importKey } from '~/utils/user/user-keys'

interface SecretSender extends MessageType {
  body: string
  sender: string
}

export function useMessages() {
  // load local storage here

  const newMessages = api.messages.loadNewMessages.useQuery(undefined, {
    staleTime: Infinity,
    onSuccess: async data => {
      console.log('start')
      const { privKey } = getSerializedKeyPair('secretSenderKey') as KeyPairType<JsonWebKey>
      const sk = await importKey(JSON.stringify(privKey), 'decrypt')
      console.log('a')
      const messages: SecretSender[] = await Promise.all(
        data.map(async encrypted => {
          const chunks = []
          for (var i = 0, charsLength = encrypted.body.length; i < charsLength; i += 684) {
            chunks.push(encrypted.body.substring(i, i + 684))
          }

          let final_str = ''
          for (const chunk of chunks) {
            const decoded = stringToBuffer(chunk)
            final_str = final_str.concat(
              utf8ToString(await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, sk, decoded))
            )
          }

          return (await JSON.parse(final_str)) satisfies SecretSender
        })
      )
      loadIdentity()
      reloadMessages()
      for (const message of messages) {
        if (message.type === 1) {
          loadSession(message.sender)
        }
        const pmsg = await decryptMessage(message, message.sender) // processed message
        addMessage(message.sender, {
          message: pmsg.body,
          sender: pmsg.from,
          timestamp: pmsg.timestamp,
        })
        storeSession(message.sender)
      }

      return
    },
  })

  // subscribe to postgres updates

  // use state to preserve messages in store

  // memoize grouped messages, or set as an outside object store?
  // this is why we consider zustand
  // const groupedMessages = useMemo(() => { },

  // save to local storage
  return newMessages
}
