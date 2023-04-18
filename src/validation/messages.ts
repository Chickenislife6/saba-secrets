import { z } from 'zod'

// Zod schemas for messages
export const timestampSchema = z.object({
  timestamp: z.string().datetime().optional(),
})
