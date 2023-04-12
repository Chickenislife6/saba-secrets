import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'

import { Button } from '~/components/common/Button'
import { ErrorAlert } from '~/components/common/ErrorAlert'
import { TextField } from '~/components/common/Fields'
import { AuthLayout } from '~/layouts/AuthLayout'
import { loginSchema, type ILogin } from '~/validation/auth'

export default function Login() {
  const { register, handleSubmit, reset } = useForm<ILogin>({
    resolver: zodResolver(loginSchema),
  })

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onSubmit: SubmitHandler<ILogin> = useCallback(
    async credentials => {
      try {
        // Note CSRF is handled via this function
        const res = await signIn('credentials', {
          ...credentials,
          redirect: false,
          callbackUrl: '/',
        })

        if (res?.error) {
          // toast.error('Log in failed')
          throw new Error(res.error)
        }
        reset()
      } catch (err) {
        console.error(err)
        setErrorMessage('Log in failed. Please try again.')
      }
    },
    [reset, setErrorMessage]
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
            inputRegister={register('username')}
          />
          <TextField
            label="Password"
            id="password"
            type="password"
            autoComplete="current-password"
            required
            inputRegister={register('password')}
          />
        </div>
        <Button type="submit" color="purple" className="mt-8 w-full">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
