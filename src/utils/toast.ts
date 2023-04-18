import { defaultToast, type ToastHandler } from '~/components/toast'

export const toast: {
  success: ToastHandler
  error: ToastHandler
} = {
  success: (message, options) => defaultToast('success', message, options),
  error: (message, options) => defaultToast('error', message, options),
}
