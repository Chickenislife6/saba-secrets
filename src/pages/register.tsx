import Link from 'next/link'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '~/components/common/Button'
import { TextField } from '~/components/common/Fields'
import { AuthLayout } from '~/layouts/AuthLayout'
import { registerSchema, type IRegister } from '~/validation/auth'
// import { api } from '~/utils/api'

export default function Register() {
  // TODO: Add trpc.registration router
  // TODO: Add nextauth login

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IRegister>({
    resolver: zodResolver(registerSchema),
  })

  //   const { mutateAsync } = api.user.register.useMutation()

  // TODO: add mutate and reset/redirect to main
  const onSubmit: SubmitHandler<IRegister> = async data => {
    console.log(data)
  }

  return (
    <AuthLayout
      title="Create an account"
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <TextField
            label="Username"
            id="username"
            type="username"
            autoComplete="username"
            required
            inputRegister={register('username')}
            errorMessage={errors.username?.message}
          />
          <TextField
            label="Password"
            id="password"
            type="password"
            autoComplete="newPassword"
            required
            inputRegister={register('password')}
            errorMessage={errors.password?.message}
          />
          <TextField
            label="Confirm password"
            id="confirmPassword"
            type="password"
            required
            inputRegister={register('confirmPassword')}
            errorMessage={errors.confirmPassword?.message}
          />
        </div>
        <Button type="submit" color="purple" className="mt-8 w-full" disabled={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
