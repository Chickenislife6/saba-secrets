import { XCircleIcon } from '@heroicons/react/24/solid'
import { type ReactNode } from 'react'

type ErrorAlertProps = {
  message: ReactNode
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="rounded-md bg-red-50 p-4 -mt-12 mb-4 sm:-mt-16">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{message}</h3>
        </div>
      </div>
    </div>
  )
}
