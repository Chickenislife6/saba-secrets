import Link from 'next/link'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/common/Button'
import { TextField } from '~/components/common/Fields'
import { AuthLayout } from '~/layouts/AuthLayout'
import { loginSchema, type ILogin } from '~/validation/auth'

export default function Login() {
  const { register, handleSubmit } = useForm<ILogin>({
    resolver: zodResolver(loginSchema),
  })

  // TODO: add nextauth signin and reset/redirect to main
  const onSubmit: SubmitHandler<ILogin> = async data => {
    console.log(data)
  }

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle={
        <>
          Don’t have an account?{' '}
          <Link href="/register" className="text-purple-700 hover:text-purple-900 hover:underline">
            Sign up
          </Link>{' '}
          to get started.
        </>
      }
    >
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
