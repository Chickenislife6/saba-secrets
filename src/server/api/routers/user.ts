import { DeviceType } from '@privacyresearch/libsignal-protocol-typescript'
import { TRPCError } from '@trpc/server'
import { hash } from 'argon2'

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { registerWithKeysSchema, usernameSchema } from '~/validation/auth'

export const userRouter = createTRPCRouter({
  checkUsername: publicProcedure.input(usernameSchema).query(async ({ input, ctx }) => {
    const { username } = input

    const userExists = await ctx.prisma.user.findFirst({
      where: { username },
    })

    return userExists === null
  }),

  register: publicProcedure.input(registerWithKeysSchema).mutation(async ({ input, ctx }) => {
    const { username, password, identityPublicKey, signedPreKey, oneTimePreKey, secretSenderKey } =
      input

    // This redundancy exists to safeguard against client-side attacks
    const userExists = await ctx.prisma.user.findFirst({
      where: { username },
    })

    if (userExists) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Username already exists',
      })
    }

    // By default, use argon2id specifications as recommended by OWASP
    // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
    // Further options can be found here: https://github.com/ranisalt/node-argon2/wiki/Options
    const hashedPassword = await hash(password)

    const result = await ctx.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        identityPublicKey,
        signedPreKey: {
          create: signedPreKey,
        },
        oneTimePreKeys: {
          create: oneTimePreKey,
        },
        secretSenderKey,
      },
    })

    return {
      status: 201,
      message: 'Account created successfully',
      data: { id: result.id, username: result.username },
    }
  }),

  getUser: publicProcedure.input(usernameSchema).query(async ({ ctx, input }) => {
    return ctx.prisma.user.findUnique({ where: { username: input.username } })
  }),

  getPreKeyBundle: publicProcedure.input(usernameSchema).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { username: input.username } })
    if (user === null) {
      throw new TRPCError({ message: 'user does not exist!', code: 'INTERNAL_SERVER_ERROR' })
    }

    const signedPreKey = await ctx.prisma.signedPreKey.findUnique({
      where: { username: user.username },
    })
    const preKey = await ctx.prisma.oneTimePreKey.findFirst({ where: { username: input.username } })
    // commented out for easier dev experience
    // const preKey = await ctx.prisma.oneTimePreKey.delete({ where: { username: input.username } })
    if (preKey === null) {
      throw new TRPCError({ message: 'user is out of prekeys!', code: 'INTERNAL_SERVER_ERROR' })
    }

    const bundle = {
      identityKey: user.identityPublicKey,
      signedPreKey: signedPreKey!,
      preKey: preKey,
    } satisfies DeviceType<string>
    return bundle
  }),
})
