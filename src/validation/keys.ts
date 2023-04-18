import { z } from 'zod'

// Zod schemas for serialized user keys
export const identityPublicKeySchema = z.string().nonempty()

export const preKeySchema = z.object({
  keyId: z.number(),
  publicKey: z.string().nonempty(),
})

export const signedPreKeySchema = preKeySchema.extend({
  signature: z.string().nonempty(),
})
