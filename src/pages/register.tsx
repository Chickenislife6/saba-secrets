import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'

import { Button } from '~/components/common/Button'
import { ErrorAlert } from '~/components/common/ErrorAlert'
import { TextField } from '~/components/common/Fields'
import { Link } from '~/components/common/Link'
import { AuthLayout } from '~/layouts/AuthLayout'
import { api } from '~/utils/api'
import { serializePublicUserKeys } from '~/utils/serialize'
import { toast } from '~/utils/toast'
import { createNewUserKeys, extractPublicUserKeys } from '~/utils/user/user-keys'
import { registerWithPWMatchSchema, type RegisterFields } from '~/validation/auth'

export default function Register() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerWithPWMatchSchema),
  })

  // Prefer error alert over toast for persist, standard UX
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // This to asynchronously check if the username is taken on demand (i.e., the submit event)
  const checkUsername = api.useContext().user.checkUsername
  const { mutateAsync, isLoading } = api.user.register.useMutation()

  const onSubmit: SubmitHandler<RegisterFields> = useCallback(
    async credentials => {
      const { username } = credentials
      try {
        const userExists = await checkUsername.fetch({ username }, { staleTime: Infinity })
        if (!userExists) {
          throw new Error('User exists')
        }

        // Create Signal keys
        const userKeys = await createNewUserKeys()
        const publicUserKeys = extractPublicUserKeys(userKeys)
        const serializedUserKeys = serializePublicUserKeys(publicUserKeys)

        const result = await mutateAsync({ ...credentials, ...serializedUserKeys })
        if (result.status === 201) {
          // store and persist user, encrypt using userId as key

          reset()
          setErrorMessage(null)
          // success toast for account created
          toast.success({ primary: 'Account created successfully!' })
          void router.push('/login')
        }
      } catch (error) {
        console.error(error)

        // TODO: refactor error handling, possibly have checkUsername throw TRPC error
        // TODO: descriptive error messages for other Zod and TRPC errors
        // TODO: test mutation to see if error is thrown via mutateAsync or just returned via
        //       error from useMutation (which will be typed and formatted)
        if (error instanceof Error && error.message === 'User exists') {
          setErrorMessage('That username is taken. Please try another.')
        } else {
          setErrorMessage('Sign up failed. Please try again.')
        }
      }
    },
    [mutateAsync, checkUsername, reset, router]
  )

  return (
    <AuthLayout
      title="Create an account"
      subtitle={
        <>
          Already registered? <Link href="/login">Sign in</Link> to your account.
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
        <Button
          type="submit"
          color="purple"
          className="mt-8 w-full"
          disabled={isSubmitting || isLoading}
        >
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
