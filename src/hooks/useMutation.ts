import { useCallback } from 'react'

import { HttpClient } from '../context/HttpClient'
import { useHttp } from '../context/HttpContext'

import { useErrorToast } from '@src/hooks/useError'

export function useMutation<T = any, D extends any[] = any[]>(
  onTry: (client: HttpClient, ...args: D) => Promise<T>,
  onCatch?: (e: any) => void
) {
  const client = useHttp()
  const { onError } = useErrorToast()
  return useCallback(
    (...args: D) => {
      try {
        return onTry(client, ...args)
      } catch (e: any) {
        if (onCatch) {
          onCatch(e)
        } else {
          onError(e)
        }
        throw e
      }
    },
    [client, onTry, onCatch, onError]
  )
}
