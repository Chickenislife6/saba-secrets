/* 
    TODO: Chats page
    Primary Components: ChatList, Chat, Navbar/Sidebar
    Secondary Components: 
        ChatList: ChatListHeader, ChatListRow 
        Chat: ChatHeader, ChatMessage, ChatInput
        Profile Modal (for viewing other users' profiles)

*/

import { signOut, useSession } from 'next-auth/react'
import { type ReactElement } from 'react'

import { Link } from '~/components/common/Link'
import { useMessages } from '~/hooks/use-messages'
import { ChatLayout } from '~/layouts/ChatLayout'
import { loadIdentity } from '~/utils/identity/state'

export default function Chats() {
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
    </div>
  )
}

Chats.getLayout = function getLayout(page: ReactElement) {
  return <ChatLayout>{page}</ChatLayout>
}
