import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form/dist/types/form'

const formClasses =
  'block w-full appearance-none rounded-lg border bg-white py-[calc(theme(spacing.2)-1px)] px-[calc(theme(spacing.3)-1px)] sm:text-sm focus:outline-none '

const normInputClasses =
  'border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500'

const errorInputClasses =
  'border-red-300 text-red-900 ring-red-400 placeholder:text-red-300 focus:ring-red-500 focus:border-red-500'

type LabelProps = {
  id: string
  children?: ReactNode
}

function Label({ id, children }: LabelProps) {
  return (
    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-gray-900">
      {children}
    </label>
  )
}

type ErrorMessageProps = {
  id: string
  message: string
}

function ErrorMessage({ id, message }: ErrorMessageProps) {
  return (
    <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
      {message}
    </p>
  )
}

type TextFieldProps = {
  id: string
  label?: ReactNode
  inputRegister?: UseFormRegisterReturn
  errorMessage?: string
} & InputHTMLAttributes<HTMLInputElement>

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  props,
  ref
) {
  const { id, label, type = 'text', className, inputRegister, errorMessage, ...rest } = props

  const inputClasses = clsx(formClasses, errorMessage ? errorInputClasses : normInputClasses)

  return (
    <div className={className}>
      {label && <Label id={id}>{label}</Label>}
      <div className="relative rounded-md shadow-sm">
        <input
          id={id}
          type={type}
          ref={ref}
          className={inputClasses}
          aria-invalid={!!errorMessage}
          {...inputRegister}
          {...rest}
        />
        {errorMessage && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>

      {errorMessage && <ErrorMessage id={id} message={errorMessage} />}
    </div>
  )
})
