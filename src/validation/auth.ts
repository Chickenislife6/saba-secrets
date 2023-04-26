import { z } from 'zod'
import { identityPublicKeySchema, preKeySchema, signedPreKeySchema } from './keys'

// Client-side error handling/validation done here, server-side is done via the TRPC router
const MIN_USERNAME_LENGTH = 5
const MAX_USERNAME_LENGTH = 32
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 64

export const loginSchema = z.object({
  username: z.string().nonempty('Username is required').toLowerCase(),
  password: z.string().nonempty('Password is required'),
})

export const usernameSchema = z.object({
  username: z
    .string()
    .nonempty('Username is required')
    .min(MIN_USERNAME_LENGTH, `Username must be at least ${MIN_USERNAME_LENGTH} characters`)
    .max(MAX_USERNAME_LENGTH, `Username must be at most ${MAX_USERNAME_LENGTH} characters`)
    .toLowerCase(),
})

export const registerSchema = usernameSchema.extend({
  password: z
    .string()
    .nonempty('Password is required')
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .max(MAX_PASSWORD_LENGTH, `Password must be at most ${MAX_PASSWORD_LENGTH} characters`),
  confirmPassword: z.string().nonempty('Password confirmation is required'),
  // terms & conditions to be added later
  // terms: z.literal(true, {
  // errorMap: () => ({ message: "You must accept the terms and conditions" }),
  // }),
})

export const registerWithPWMatchSchema = registerSchema.refine(
  ({ password, confirmPassword }) => password === confirmPassword,
  {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  }
)

export const registerWithKeysSchema = registerSchema.extend({
  identityPublicKey: identityPublicKeySchema,
  signedPreKey: signedPreKeySchema,
  oneTimePreKey: preKeySchema,
  // this is supposed to be a JsonWebKey
  secretSenderKey: z.string(),
})
export type LoginFields = z.infer<typeof loginSchema>
export type RegisterFields = z.infer<typeof registerSchema>

export const messageSchema = z.object({
  message: z.string(),
})

export const sendMessageSchema = z.object({
  recipient: z.string(),
  message: z.string(),
})

export type MessageField = z.infer<typeof messageSchema>

export const addSessionSchema = usernameSchema.extend({
  preKeyBundle: z.object({
    identityKey: z.string(),
    signedPreKey: z.object({
      keyId: z.number(),
      publicKey: z.string(),
      signature: z.string(),
    }),
    preKey: z.object({
      keyId: z.number(),
      publicKey: z.string(),
    }),
  }),
})
