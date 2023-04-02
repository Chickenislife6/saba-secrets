import Link from 'next/link'

import { Button } from '~/components/common/Button'
import { TextField } from '~/components/common/Fields'
import { AuthLayout } from '~/layouts/AuthLayout'

export default function Login() {
  // TODO: Add nextauth login

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle={
        <>
          Don’t have an account?{' '}
          <Link href="/register" className="text-purple-700 hover:text-purple-900 hover:underline">
            Sign up
          </Link>{' '}
          for a free trial.
        </>
      }
    >
      <form>
        <div className="space-y-6">
          <TextField
            label="Username"
            id="username"
            name="username"
            type="username"
            autoComplete="username"
            required
          />
          <TextField
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" color="purple" className="mt-8 w-full">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
