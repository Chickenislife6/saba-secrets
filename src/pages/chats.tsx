/* 
    TODO: Chats page
    Primary Components: ChatList, Chat, Navbar/Sidebar
    Secondary Components: 
        ChatList: ChatListHeader, ChatListRow 
        Chat: ChatHeader, ChatMessage, ChatInput
        Profile Modal (for viewing other users' profiles)

*/

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { type ReactElement } from 'react'

import { ChatLayout } from '~/layouts/ChatLayout'

export default function Chats() {
  const { data } = useSession({
    required: true,
  })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-center text-2xl font-extrabold">Chats</h1>
      {data && (
        <>
          <p className="text-center text-lg">
            <span>Username: {data.user.username}</span>
            <br />
            <Link href="/profile" className="text-purple-700 hover:text-purple-500 hover:underline">
              Go to profile
            </Link>
          </p>
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
