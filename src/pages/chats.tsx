/* 
    TODO: Chats page
    Primary Components: ChatList, Chat, Navbar/Sidebar
    Secondary Components: 
        ChatList: ChatListHeader, ChatListRow 
        Chat: ChatHeader, ChatMessage, ChatInput
        Profile Modal (for viewing other users' profiles)

*/

import { zodResolver } from '@hookform/resolvers/zod'
import { signOut, useSession } from 'next-auth/react'
import { useCallback, useEffect, useState, type ReactElement } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Button } from '~/components/common/Button'
import { ErrorAlert } from '~/components/common/ErrorAlert'
import { TextField } from '~/components/common/Fields'

import { Link } from '~/components/common/Link'
import { Message } from '~/components/common/Message'
import { useMessages } from '~/hooks/use-messages'
import { useObservable } from '~/hooks/use-observable'
import { ChatLayout } from '~/layouts/ChatLayout'
import { api } from '~/utils/api'
import { addSession, loadIdentity, loadSession, store, storeSession } from '~/utils/identity/state'
import { encryptMessage } from '~/utils/messages/crypto'
import { addMessage, current_subject, loadMessages, sessionSubject } from '~/utils/messages/state'
import {
  addPublicKey,
  encryptWithKey,
  loadPublicKeys,
  publicKeys,
} from '~/utils/secretSender/state'
import { MessageField, messageSchema } from '~/validation/auth'

export default function Chats() {
  const [chat, setChat] = useState('')
  const [show, setShow] = useState(false)
  const { data } = useSession({
    required: true,
  })

  if (typeof window !== 'undefined') {
    loadIdentity()
  }
  const messages = useMessages()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-center text-2xl font-extrabold">Chats</h1>
      {data && (
        <>
          <div className="text-center text-lg">
            <p>Username: {data.user.username}</p>
            <Link href="/profile">Go to profile</Link>
          </div>
          <button
            className="rounded-full bg-black/10 px-10 py-3 font-semibold text-black no-underline transition hover:bg-black/20"
            onClick={() =>
              void signOut({
                callbackUrl: '/',
              })
            }
          >
            Sign out
          </button>
        </>
      )}
      <input onChange={e => setChat(e.target.value)} placeholder="adfasdfds"></input>
      <input
        type="button"
        onClick={() => {
          setShow(!show)
        }}
        value="Show chat!"
      ></input>
      {show ? <Chat recipient={chat} user={data?.user.username!} /> : <></>}
    </div>
  )
}

Chats.getLayout = function getLayout(page: ReactElement) {
  return <ChatLayout>{page}</ChatLayout>
}

type props = {
  recipient: string
  user: string
}
function Chat(props: props) {
  // const [message, setMessage] = useState('')
  const mutation = api.messages.sendMessage.useMutation()

  const [fetchPreKey, setFetchPreKey] = useState(false)
  const [fetchPK, setFetchPK] = useState(false)

  const messages = useObservable(sessionSubject, [])
  console.log(messages)
  console.log(current_subject)

  useEffect(() => {
    loadMessages(props.recipient)
    loadPublicKeys()
    setFetchPreKey(!loadSession(props.recipient).success)
    if (publicKeys[props.recipient] === undefined) setFetchPK(true)
  }, [])

  const { data: preKeyBundle, error: fetchError } = api.user.getPreKeyBundle.useQuery(
    { username: props.recipient },
    {
      staleTime: Infinity,
      enabled: fetchPreKey,
    }
  )
  const { data: userInfo } = api.user.getUser.useQuery(
    { username: props.recipient },
    {
      staleTime: Infinity,
      enabled: fetchPK,
    }
  )
  if (!!userInfo) {
    addPublicKey(userInfo.secretSenderKey, props.recipient)
  }

  if (!!preKeyBundle) {
    addSession(preKeyBundle, props.recipient)
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MessageField>({
    resolver: zodResolver(messageSchema),
  })

  // Prefer error alert over toast for persist, standard UX
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onSubmit: SubmitHandler<MessageField> = useCallback(
    async message => {
      // try {
      const ct = await encryptMessage(props.recipient, props.user, message.message, store)
      console.log('ct')
      const secretSender = await encryptWithKey(
        props.recipient,
        JSON.stringify({ ...ct, sender: props.user })
      )
      storeSession(props.recipient)

      mutation.mutate({
        message: secretSender!,
        recipient: props.recipient,
      })
      addMessage(props.recipient, {
        message: message.message,
        sender: props.user,
        timestamp: Date.now(),
      })
      // } catch (_e) {
      // setErrorMessage('test')
      // setErrorMessage((_e as Error).message + 'error')
      // }
    },
    [props.recipient]
  )

  // unsure why this doesn't work
  if (fetchError) {
    return <div>{fetchError.message}</div>
  }
  return (
    <div>
      {errorMessage && <ErrorAlert message={errorMessage} />}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <TextField
            label="Chatbox"
            id="Chatbox"
            type="Chatbox"
            autoComplete="Chatbox"
            autoFocus
            required
            inputRegister={register('message')}
          />
        </div>
        {messages.map(msg => (
          <Message
            message={msg.message}
            sender={msg.sender}
            timestamp={msg.timestamp}
            recipient={props.user}
          />
        ))}
        <Button type="submit" color="purple" className="mt-8 w-full" disabled={isSubmitting}>
          Send Message
        </Button>
      </form>
    </div>
  )
}
