import { useCallback } from 'react'

import { ApiClient } from '.'
import { useHttp } from './HttpProvider'

import { useErrorToast } from '@src/hooks/useError'

export function useMutation<T = any, D extends any[] = any[]>(
  onTry: (apiClient: ApiClient, ...args: D) => Promise<T>,
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
