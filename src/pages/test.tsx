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
import type { FormEvent, ReactElement } from 'react'
import { useCallback, useRef } from 'react'

import { Button } from '~/components/common/Button'
import { TextField } from '~/components/common/Fields'
import { ChatLayout } from '~/layouts/ChatLayout'
import { toast } from '~/utils/toast'
import { testIdentityKey } from '~/utils/user/user-keys'

export default function Profile() {
  const { data } = useSession({
    required: true,
  })

  const sabaInput = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      testIdentityKey()
    },
    [data?.user]
  )

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-center text-2xl font-extrabold">Profile</h1>
      {data && (
        <>
          <div className="break-all text-center text-lg">
            <p>Id: {data.user.id}</p>
            <p>Username: {data.user.username}</p>
            <p>Identity PK: {data.user.identityPublicKey}</p>
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
          <form onSubmit={handleSubmit}>
            <TextField id="saba" label="Saba Code" type="text" ref={sabaInput} autoFocus required />
            <Button
              type="submit"
              variant="outline"
              color="purple"
              className="mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit
            </Button>
          </form>
          <button
            className="rounded-full bg-black/10 px-10 py-3 font-semibold text-black no-underline transition hover:bg-black/20"
            onClick={() => toast.success({ primary: 'hello' })}
          >
            Click me
          </button>
        </>
      )}
    </div>
  )
}

Profile.getLayout = function getLayout(page: ReactElement) {
  return <ChatLayout>{page}</ChatLayout>
}
