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
import { useCallback, useRef, useState } from 'react'

import { Button } from '~/components/common/Button'
import { TextField } from '~/components/common/Fields'
import { ChatLayout } from '~/layouts/ChatLayout'
import { cyrb53, decrypt, deriveKey, encrypt, hash } from '~/utils/crypto'
import { toast } from '~/utils/toast'

export default function Profile() {
  const { data } = useSession({
    required: true,
  })

  const [derivedKey, setDerivedKey] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const sabaInput = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      setIsSubmitting(true)

      const saba = sabaInput.current?.value

      // If not in a secure context, probably should prevent user from logging in
      if (!isSecureContext || !data?.user || saba === undefined) {
        return
      }

      const username = data.user.username

      // Proof of concept testing on hashing short saba code for username hash
      console.log(`START: ${saba}`)

      // Average ~1-3ms (varies wildly)
      console.time('hash')
      const hashedSaba = await hash(username + saba)
      console.timeEnd('hash')

      console.log(hashedSaba, hashedSaba.length)

      // Average ~100ms for 10e5 iterations, 18ms for 10e4, 2.5ms for 10e3
      console.time('pbkdf2')
      const pbkdf2 = await deriveKey(saba, 10e3) // default iterations is 10e5
      // const pbkdf2 = await deriveKey(saba, iterations)
      console.timeEnd('pbkdf2')

      // Average ~0.06ms
      console.time('encrypt AES-GCM + encode')
      const { ciphertext, iv } = await encrypt(username, pbkdf2.derivedKey)
      console.timeEnd('encrypt AES-GCM + encode')

      console.log(ciphertext, ciphertext.length)

      // Average ~0.06ms
      console.time('decrypt AES-GCM + decode')
      const decrypted = await decrypt(ciphertext, pbkdf2.derivedKey, iv)
      console.timeEnd('decrypt AES-GCM + decode')

      console.log(decrypted, decrypted.length)

      // Cyrb53 returns a presumably collision resistant integer hash, performs
      // extremely fast at ~0.01ms on average.
      console.time('cyrb53')
      const cyrb = cyrb53(username + saba)
      console.timeEnd('cyrb53')

      console.log(cyrb)

      if (derivedKey === hashedSaba) {
        toast.error({ primary: 'You entered the same hash!', secondary: 'Please try another one.' })
      } else {
        toast.success({ primary: 'Successfully hashed!', secondary: 'Please try another input.' })
      }

      setDerivedKey(hashedSaba)
      sabaInput.current?.focus()
      setIsSubmitting(false)
    },
    [data?.user, derivedKey]
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
            <p>Saba Hash: {derivedKey}</p>
            <p>Hash Length: {derivedKey.length}</p>
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
              disabled={isSubmitting}
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
