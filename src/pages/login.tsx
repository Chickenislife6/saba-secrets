import Link from 'next/link'
import { useCallback } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { XCircleIcon } from '@heroicons/react/24/solid'

import { Button } from '~/components/common/Button'
import { TextField } from '~/components/common/Fields'
import { AuthLayout } from '~/layouts/AuthLayout'
import { loginSchema, type ILogin } from '~/validation/auth'

export default function Login() {
  const { register, handleSubmit, reset } = useForm<ILogin>({
    resolver: zodResolver(loginSchema),
  })

  // TODO: add nextauth signin and reset/redirect to main
  const onSubmit: SubmitHandler<ILogin> = useCallback(
    async credentials => {
      try {
        console.log(credentials)
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
      }
    },
    [reset]
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
      {/* <div className="rounded-md bg-red-50 p-4 -mt-12 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Log in failed. Please try again.</h3>
          </div>
        </div>
      </div> */}

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
