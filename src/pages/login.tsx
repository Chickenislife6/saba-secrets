import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'

import { Button } from '~/components/common/Button'
import { ErrorAlert } from '~/components/common/ErrorAlert'
import { TextField } from '~/components/common/Fields'
import { Link } from '~/components/common/Link'
import { AuthLayout } from '~/layouts/AuthLayout'
import { loginSchema, type LoginFields } from '~/validation/auth'

export default function Login() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  })

  // Prefer error alert over toast for persist, standard UX
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onSubmit: SubmitHandler<LoginFields> = useCallback(
    async credentials => {
      // Note CSRF is handled via this function
      const res = await signIn('credentials', {
        ...credentials,
        redirect: false,
      })

      console.log(res)
      // TODO: Handle other error types from response
      if (res?.status === 401) {
        return setErrorMessage('Invalid username or password. Please try again.')
      } else if (!res?.ok) {
        return setErrorMessage('Log in failed. Please try again.')
      } else {
        setErrorMessage(null)
        void router.push('/chats')
      }
    },
    [router]
  )

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle={
        <>
          Don’t have an account? <Link href="/register">Sign up</Link> to get started.
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
            autoFocus
            required
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
