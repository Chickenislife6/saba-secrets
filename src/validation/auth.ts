import { z } from 'zod'
import { identityPublicKeySchema, preKeySchema, signedPreKeySchema } from './keys'

// Client-side error handling/validation done here, server-side is done via the TRPC router

export const loginSchema = z.object({
  username: z.string().nonempty('Username is required').toLowerCase(),
  password: z.string().nonempty('Password is required'),
})

export const usernameSchema = z.object({
  username: z
    .string()
    .nonempty('Username is required')
    .min(5, 'Username must be at least 5 characters')
    .max(100, 'Username must be at most 100 characters')
    .toLowerCase(),
})

export const registerSchema = usernameSchema.extend({
  password: z
    .string()
    .nonempty('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be at most 64 characters'),
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
})

export type ILogin = z.infer<typeof loginSchema>
export type IRegister = z.infer<typeof registerSchema>
