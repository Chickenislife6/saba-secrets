import { z } from 'zod'

// Client-side error handling/validation done here, server-side is done via the TRPC router
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(100),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be at most 64 characters'),
})

export const registerSchema = loginSchema
  .extend({
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
    // terms & conditions to be added later
    // terms: z.literal(true, {
    // errorMap: () => ({ message: "You must accept the terms and conditions" }),
    // }),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export type ILogin = z.infer<typeof loginSchema>
export type IRegister = z.infer<typeof registerSchema>
