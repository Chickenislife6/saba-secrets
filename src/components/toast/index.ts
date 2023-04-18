import React from 'react'
import { toast as toastHandler, type ToastOptions } from 'react-hot-toast'

import { Toaster } from './Toaster'
import { ToastMessage, type ToastMessageProps } from './ToastMessage'

/*
  This implementation allows us to 'overload' the current toast handler (very limited, disallows
  for reuse between implementations) to allow for a simpler API (only needing to import toast 
  instead of toast, ToastMessage, etc). This is a very hacky solution, but it works to get us from:

  Old: 
  import { toast, ToastMessage } ...'
  ...
  toast.error(
    <ToastMessage primary="You entered the same hash!" secondary="Please try another one." />,
    { position: 'top-right' }
  )

  New: 
  import { toast } from '~/utils/toast'
  toast.error({ primary: 'You entered the same hash!', secondary: 'Please try another one.'})

  TODO: add more options to the toast handler to allow for more customization

  Note: default toast.success duration is 2000ms, default toast.error duration is 4000ms.
  Can change options to override this behavior.

  toast.success({ primary: 'Hello' }, { duration: 6000 })

  See https://react-hot-toast.com/docs/version-2 for more details
*/
type ToastHandlerKey = keyof Pick<typeof toastHandler, 'success' | 'error'>

// Default toast setting
function defaultToast(key: ToastHandlerKey, message: ToastMessageProps, options?: ToastOptions) {
  return toastHandler[key](React.createElement(ToastMessage, { ...message }), {
    position: 'top-right',
    ...options,
  })
}

type ToastHandler = (message: ToastMessageProps, options?: ToastOptions) => string

export type { ToastHandler }
export { Toaster, defaultToast }
