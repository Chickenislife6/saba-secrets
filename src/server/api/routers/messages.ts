import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const messagesRouter = createTRPCRouter({
  loadNewMessages: protectedProcedure.query(async ({ ctx }) => {
    const recipientId = ctx.session.user.id

    const result = await ctx.prisma.message.findMany({
      where: {
        recipientId,
      },
    })

    // delete all new messages upon reciept

    return result
  }),
})
