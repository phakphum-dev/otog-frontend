import { useCallback } from 'react'

import { HttpClient, http } from '../context/HttpClient'

import { useErrorToast } from '@src/hooks/useErrorToast'

export function useMutation<T = any, D extends any[] = any[]>(
  onTry: (client: HttpClient, ...args: D) => Promise<T>,
  onCatch?: (e: any) => void
) {
  const { onError } = useErrorToast()
  return useCallback(
    (...args: D) => {
      try {
        return onTry(http, ...args)
      } catch (e: any) {
        if (onCatch) {
          onCatch(e)
        } else {
          onError(e)
        }
        throw e
      }
    },
    [onTry, onCatch, onError]
  )
}
