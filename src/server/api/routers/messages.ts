import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { timestampSchema } from '~/validation/messages'

export const messagesRouter = createTRPCRouter({
  loadNewMessages: protectedProcedure.input(timestampSchema).query(async ({ input, ctx }) => {
    const lastMessageTimestamp = input.timestamp
    const recipientId = ctx.session.user.id

    const result = await ctx.prisma.message.findMany({
      where: {
        recipientId,
        timestamp: lastMessageTimestamp ? { gt: new Date(lastMessageTimestamp) } : undefined,
      },
      orderBy: { timestamp: 'asc' },
    })

    return result
  }),
})
