import { TRPCError } from '@trpc/server'
import { hash } from 'argon2'

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { usernameSchema, registerSchema } from '~/validation/auth'

export const userRouter = createTRPCRouter({
  checkUsername: publicProcedure.input(usernameSchema).query(async ({ input, ctx }) => {
    const { username } = input

    const userExists = await ctx.prisma.user.findFirst({
      where: { username },
    })

    return !!userExists
  }),

  register: publicProcedure.input(registerSchema).mutation(async ({ input, ctx }) => {
    const { username, password } = input

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

    // TODO: add identity key and signed public prekey
    const result = await ctx.prisma.user.create({
      data: { username, password: hashedPassword },
    })

    return {
      status: 201,
      message: 'Account created successfully',
      data: { id: result.id, username: result.username },
    }
  }),
})
