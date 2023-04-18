import type { NextPage } from 'next'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import { Inter } from 'next/font/google'
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

const inter = Inter({ subsets: ['latin'] })

// Dynamic import resolves hydration errors stemming from css-in-js dependency
// from react-hot-toast (goober), and allows for pre-rendering on all else
// https://nextjs.org/docs/messages/react-hydration-error
const Toaster = dynamic(() => import('~/components/toast/Toaster').then(mod => mod.Toaster), {
  ssr: false,
})

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout<WithSession>) => {
  const getLayout = Component.getLayout || (page => page)

  return (
    <>
      <Head>
        <title>SabaSecrets</title>
        <meta
          name="description"
          content="A web-based end-to-end encrypted messaging app based off the Signal Protocol"
        />
        <meta
          name="keywords"
          content="saba secrets, end-to-end encryption, zero knowledge, end-to-end encrypted messaging, secure messaging"
        />
        <link rel="icon" href="/favicon-bgp.ico" />
      </Head>
      <SessionProvider session={session}>
        <div className={inter.className}>
          {getLayout(<Component {...pageProps} />)}
          <Toaster />
        </div>
      </SessionProvider>
    </>
  )
}

export default api.withTRPC(MyApp)
