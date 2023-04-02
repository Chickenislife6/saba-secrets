import Link from 'next/link'

import { Button } from '~/components/common/Button'
import { TextField } from '~/components/common/Fields'
import { AuthLayout } from '~/layouts/AuthLayout'

export default function Register() {
  // TODO: Add validation
  // TODO: Add error handling with react-hook-form
  // TODO: Add trpc.registration router
  // TODO: Add nextauth login

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle={
        <>
          Already registered?{' '}
          <Link href="/login" className="text-purple-700 hover:text-purple-900 hover:underline">
            Sign in
          </Link>{' '}
          to your account.
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
            autoComplete="new-password"
            required
          />
          <TextField
            label="Confirm password"
            id="confirm-password"
            name="confirm-password"
            type="password"
            required
          />
        </div>
        <Button type="submit" color="purple" className="mt-8 w-full">
          Sign up
        </Button>
      </form>
    </AuthLayout>
  )
}
