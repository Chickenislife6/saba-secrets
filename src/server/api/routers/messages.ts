import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const messagesRouter = createTRPCRouter({
  loadNewMessages: protectedProcedure.query(async ({ ctx }) => {
    const recipientId = ctx.session.user.id

    const result = await ctx.prisma.message.findMany({
      where: {
        recipientId,
      },
    })

    const ids = result.map(({ id }) => id)
    // delete all new messages upon reciept
    ctx.prisma.message.deleteMany({
      where: {
        id: { in: ids },
      },
    })
    return result
  }),
})
