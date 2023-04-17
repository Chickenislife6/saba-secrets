import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form/dist/types/form'

const formClasses =
  'block w-full appearance-none rounded-lg border border-gray-200 bg-white py-[calc(theme(spacing.2)-1px)] px-[calc(theme(spacing.3)-1px)] text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm'

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
  message: string
}

function ErrorMessage({ message }: ErrorMessageProps) {
  return <div className="text-sm text-red-700">{message}</div>
}

type TextFieldProps = {
  id: string
  label?: ReactNode
  // UseFormRegisterReturn is necessary here to use react-hook-form validation features as
  // it passes a ref to the input element, which cannot be passed in functional components
  inputRegister?: UseFormRegisterReturn
  errorMessage?: string
} & InputHTMLAttributes<HTMLInputElement>

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  props,
  ref
) {
  const { id, label, type = 'text', className, inputRegister, errorMessage, ...rest } = props
  return (
    <div className={className}>
      {label && <Label id={id}>{label}</Label>}
      <input id={id} type={type} ref={ref} {...inputRegister} {...rest} className={formClasses} />
      {errorMessage && <ErrorMessage message={errorMessage} />}
    </div>
  )
})
