/* 
    TODO: Chats page
    Primary Components: ChatList, Chat, Navbar/Sidebar
    Secondary Components: 
        ChatList: ChatListHeader, ChatListRow 
        Chat: ChatHeader, ChatMessage, ChatInput
        Profile Modal (for viewing other users' profiles)

*/

import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState, type ReactElement } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Button } from '~/components/common/Button'
import { ErrorAlert } from '~/components/common/ErrorAlert'
import { TextField } from '~/components/common/Fields'

import { Link } from '~/components/common/Link'
import { Message } from '~/components/common/Message'
import { User } from '~/components/common/User'
import { useMessages } from '~/hooks/use-messages'
import { useObservable } from '~/hooks/use-observable'
import { ChatLayout } from '~/layouts/ChatLayout'
import { api } from '~/utils/api'
import { addSession, loadIdentity, loadSession, store, storeSession } from '~/utils/identity/state'
import { encryptMessage } from '~/utils/messages/crypto'
import {
  addMessage,
  current_subject,
  loadMessages,
  reloadMessages,
  session,
  sessionSubject,
} from '~/utils/messages/state'
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
  const reload = useObservable(sessionSubject, [])
  const { data } = useSession({
    required: true,
  })

  useEffect(() => {
    loadIdentity()
    reloadMessages()
  }, [])
  if (typeof window !== 'undefined') {
    loadIdentity()
  }
  const messages = useMessages()

  if (data === undefined) {
    return <div>loading..</div>
  }
  return (
    <div className="flex grow flex-row justify-between ">
      <div className="basis-1/4 items-start ">
        <div className="p-6">
          <h1 className="text-center text-2xl font-extrabold">Chats for {data!.user.username}</h1>
          <div className="py-1 text-center text-lg">
            <Link href="/profile">Go to profile</Link>
          </div>
          <div className="text-center"></div>
          <div className="flex justify-stretch py-1 ">
            <TextField
              placeholder="username"
              className="grow"
              id="addUser"
              type="addUser"
              autoComplete="addUser"
              onChange={e => {
                setChat(e.target.value)
                setShow(false)
              }}
            ></TextField>
            <Button onClick={() => setShow(!show)}>Add User</Button>
          </div>
          {Object.keys(session).map(key => {
            return (
              <div className="py-1">
                <User
                  handler={() => {
                    setShow(true)
                    loadMessages(key)
                    setChat(key)
                  }}
                  user={key}
                  recent_message={session[key]!.at(-1)?.message!}
                />
              </div>
            )
          })}
        </div>
      </div>
      {/* <div className="flex grow flex-col items-center justify-center gap-4"> */}
      {show ? <Chat recipient={chat} user={data?.user.username!} /> : <></>}
      {/* </div> */}
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
    <div className="flex grow flex-col justify-center p-10">
      <h1 className="py-3 text-center text-2xl font-extrabold">Chat with: {props.recipient}</h1>
      <div className="h-3/6 overflow-y-scroll">
        {errorMessage && <ErrorAlert message={errorMessage} />}
        {messages.map(msg => (
          <Message
            message={msg.message}
            sender={msg.sender}
            timestamp={msg.timestamp}
            recipient={props.user}
          />
        ))}
      </div>
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

        <Button type="submit" color="purple" className="mt-8 w-full" disabled={isSubmitting}>
          Send Message
        </Button>
      </form>
    </div>
  )
}
