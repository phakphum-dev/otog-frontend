import { useCallback } from 'react'

import { onErrorToast } from '@src/hooks/useErrorToast'

export function useMutation<T = any, D extends any[] = any[]>(
  onTry: (...args: D) => Promise<T>,
  onCatch?: (e: any) => void
) {
  return useCallback(
    (...args: D) => {
      try {
        return onTry(...args)
      } catch (e: any) {
        if (onCatch) {
          onCatch(e)
        } else {
          onErrorToast(e)
        }
        throw e
      }
    },
    [onTry, onCatch]
  )
}
