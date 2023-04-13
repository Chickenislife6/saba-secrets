import type { NextPage } from 'next'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import type { ReactElement, ReactNode } from 'react'

import { api } from '~/utils/api'

import '~/styles/globals.css'

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout<P = {}> = AppProps<P> & {
  Component: NextPageWithLayout
}

type WithSession = {
  session: Session | null
}

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout<WithSession>) => {
  const getLayout = Component.getLayout || (page => page)

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
      <SessionProvider session={session}>{getLayout(<Component {...pageProps} />)}</SessionProvider>
    </>
  )
}

export default api.withTRPC(MyApp)
