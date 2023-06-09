import { Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import type { Toast, ToastType } from 'react-hot-toast'
import { Toaster as BaseToaster, resolveValue, toast as toastHandler } from 'react-hot-toast'

export function Toaster() {
  // May need to refactor this based on react-hot-toast's Toaster implementation
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
    >
      <BaseToaster>{toast => <CustomToast t={toast} />}</BaseToaster>
    </div>
  )
}

// Note: this is a shallow implementation of a Toast component, will need to revisit at a later time
function CustomToast({ t }: { t: Toast }) {
  return (
    <Transition
      show={t.visible}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="border-thickness pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ToastIcon type={t.type} />
            </div>
            {resolveValue(t.message, t)}
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                onClick={() => {
                  toastHandler.dismiss(t.id)
                }}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  )
}

// TODO: incoporate base Toast.icon + iconTheme
function ToastIcon({ type }: { type: ToastType }) {
  switch (type) {
    case 'success':
      return <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
    case 'error':
      return <ExclamationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
    default:
      return null
  }
}
