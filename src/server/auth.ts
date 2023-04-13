import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { verify } from 'argon2'
import { type GetServerSidePropsContext } from 'next'
import {
  getServerSession,
  type DefaultSession,
  type DefaultUser,
  type NextAuthOptions,
} from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { env } from '~/env.mjs'
import { prisma } from '~/server/db'
import { loginSchema } from '~/validation/auth'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      username: string
      identityPublicKey: string
      avatar: string | null
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    username: string
    identityPublicKey: string
    avatar: string | null
    // ...other properties
    // role: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    identityPublicKey: string
    avatar: string | null
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async credentials => {
        try {
          const { username, password } = loginSchema.parse(credentials)

          const result = await prisma.user.findFirst({
            where: { username },
          })

          // Return `null` if the credentials are invalid, will throw an error for the client
          // https://next-auth.js.org/providers/credentials#example---username--password
          if (!result) return null

          const isPasswordValid = await verify(result.password, password)

          if (!isPasswordValid) return null

          return {
            id: result.id,
            username,
            identityPublicKey: result.identityPublicKey,
            avatar: result.avatar,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.identityPublicKey = user.identityPublicKey
        token.avatar = user.avatar
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.identityPublicKey = token.identityPublicKey
        session.user.avatar = token.avatar
      }
      return session
    },
  },
  session: {
    // Since we're using a database adapter with Credentials, NextAuth will not persist sessions
    // in the database by default, so we'll need to force JWT sessions instead.
    // More here: https://next-auth.js.org/errors#callback_credentials_jwt_error
    strategy: 'jwt',
  },
  jwt: {
    maxAge: 6 * 60 * 60, // 6 hours
    secret: env.NEXTAUTH_SECRET,
  },
  pages: {
    signIn: '/login', // uncomment to use custom login page
    newUser: '/register',
  },
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req']
  res: GetServerSidePropsContext['res']
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions)
}
