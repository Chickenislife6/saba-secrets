import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'

import { Button } from '~/components/common/Button'
import { ErrorAlert } from '~/components/common/ErrorAlert'
import { TextField } from '~/components/common/Fields'
import { AuthLayout } from '~/layouts/AuthLayout'
import { loginSchema, type LoginFields } from '~/validation/auth'

export default function Login() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  })

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onSubmit: SubmitHandler<LoginFields> = useCallback(
    async credentials => {
      try {
        // Note CSRF is handled via this function
        const res = await signIn('credentials', {
          ...credentials,
          redirect: false,
        })

        // TODO: Handle other error types from response
        if (res?.status === 401) {
          throw new Error('Invalid username or password. Please try again.')
        } else if (!res?.ok) {
          throw new Error('Log in failed. Please try again.')
        }

        reset()
        setErrorMessage(null)
        void router.push('/chats')
      } catch (err) {
        console.error(err)
        if (err instanceof Error) {
          setErrorMessage(err.message)
        }
      }
    },
    [reset, router]
  )

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle={
        <>
          Don’t have an account?{' '}
          <Link href="/register" className="text-purple-700 hover:text-purple-500 hover:underline">
            Sign up
          </Link>{' '}
          to get started.
        </>
      }
    >
      {errorMessage && <ErrorAlert message={errorMessage} />}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <TextField
            label="Username"
            id="username"
            type="username"
            autoComplete="username"
            required
            autoFocus
            inputRegister={register('username')}
            errorMessage={errors.username?.message}
          />
          <TextField
            label="Password"
            id="password"
            type="password"
            autoComplete="current-password"
            required
            inputRegister={register('password')}
            errorMessage={errors.password?.message}
          />
        </div>
        <Button type="submit" color="purple" className="mt-8 w-full" disabled={isSubmitting}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
