/*
    TODO: Profile page
    View, edit, delete user profile

    Note this page should only be accessible for the individual user, 
    where client and server side checks exist to ensure the user is 
    accessing their own profile. To view other users' profiles, 
    they will need to be viewed via client side modal such that 
    ids aren't easily exposed and search cannot be abused (this 
    is a common vulnerability known as insecure direct object reference,
    which can be mitigated using strong access controls, indirect object
    references, authentication, and validating inputs through a server, middleware,
    etc)
*/

import { signOut, useSession } from 'next-auth/react'
import { type ReactElement } from 'react'

import { ChatLayout } from '~/layouts/ChatLayout'

export default function Profile() {
  const { data } = useSession({
    required: false,
  })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-center text-2xl font-extrabold">Profile</h1>
      {data && (
        <>
          <p className="text-center text-lg">
            <span>Id: {data.user.id}</span>
            <br />
            <span>Username: {data.user.username}</span>
            <br />
            <span>Identity PK: {data.user.identityPublicKey}</span>
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

Profile.getLayout = function getLayout(page: ReactElement) {
  return <ChatLayout>{page}</ChatLayout>
}
