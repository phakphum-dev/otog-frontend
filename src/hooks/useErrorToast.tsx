import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

export type ErrorToastOptions = {
  title: string
  description?: string
  status?: 'success' | 'error'
  code?: number
}

export function onErrorToast(error: unknown) {
  const toastData = getErrorData(error)
  errorToast(toastData)
}

export function errorToast(toastData: ErrorToastOptions) {
  if (toastData.status) {
    toast[toastData.status](
      toastData.description ? (
        <div>
          <b>{toastData.title}</b>
          <p>{toastData.description}</p>
        </div>
      ) : (
        toastData.title
      ),
      { id: toastData.title, duration: 5000 }
    )
  } else {
    toast(
      toastData.description ? (
        <div>
          <b>{toastData.title}</b>
          <p>{toastData.description}</p>
        </div>
      ) : (
        toastData.title
      ),
      { id: toastData.title, duration: 5000 }
    )
  }
}

export function useErrorToaster(toastData: ErrorToastOptions | undefined) {
  useEffect(() => {
    if (toastData) {
      errorToast(toastData)
    }
  }, [toastData])
}

export function getErrorData(error: unknown): ErrorToastOptions {
  const err = new Error(error as any)
  console.error(error)
  return {
    title: err.name,
    description: err.message,
    status: 'error',
  }
}
