import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { sendMessageSchema } from '~/validation/auth'

export const messagesRouter = createTRPCRouter({
  loadNewMessages: protectedProcedure.query(async ({ ctx }) => {
    const recipientUser = ctx.session.user.username

    const result = await ctx.prisma.message.findMany({
      where: {
        recipientUser,
      },
    })

    const ids = result.map(({ id }) => id)
    // delete all new messages upon reciept
    const { count } = await ctx.prisma.message.deleteMany({
      where: {
        id: { in: ids },
      },
    })
    console.log(count)
    return result
  }),

  sendMessage: protectedProcedure.input(sendMessageSchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.message.create({
      data: {
        body: input.message,
        recipientUser: input.recipient,
      },
    })
  }),
})
