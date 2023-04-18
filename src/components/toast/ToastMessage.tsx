import { type ReactNode } from 'react'

type ToastMessageProps = {
  primary: ReactNode | string
  secondary?: ReactNode | string
}

// Temporary implementation - need to revise for more extensibility
// Attempting to avoid toast.custom for now due to readability
function ToastMessage({ primary, secondary }: ToastMessageProps) {
  return (
    <div className="ml-3 w-0 flex-1 pt-0.5">
      <p className="text-sm font-medium text-gray-900">{primary}</p>
      {secondary && <p className="mt-1 text-sm text-gray-500">{secondary}</p>}
    </div>
  )
}

export { ToastMessage, type ToastMessageProps }
