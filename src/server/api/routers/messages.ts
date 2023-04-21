import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { timestampSchema } from '~/validation/messages'

export const messagesRouter = createTRPCRouter({
  loadNewMessages: protectedProcedure.input(timestampSchema).query(async ({ input, ctx }) => {
    const recipientId = ctx.session.user.id

    const result = await ctx.prisma.message.findMany({
      where: {
        recipientId,
      },
    })
    return result
  }),
})
