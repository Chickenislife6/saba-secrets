import { type AppType } from 'next/app'
import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import Head from 'next/head'

import { api } from '~/utils/api'

import '~/styles/globals.css'

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <Head>
        <title>Saba Secrets</title>
        <meta
          name="description"
          content="A web-based end-to-end encrypted messaging app based off the Signal Protocol"
        />
        <meta
          name="keywords"
          content="saba secrets, end-to-end encryption, zero knowledge, end-to-end encrypted messaging, secure messaging"
        />
        <link rel="icon" href="/favicon-32x32.png" />
        {/* Styles not allowed in next/head - use next/document instead */}
        {/* <link rel="stylesheet" href="https://rsms.me/inter/inter.css" /> */}
      </Head>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  )
}

export default api.withTRPC(MyApp)
