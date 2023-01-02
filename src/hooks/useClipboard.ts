import copy from 'copy-to-clipboard'
import { useCallback, useEffect, useState } from 'react'

export function useClipboard(value: string, timeout = 1500) {
  const [hasCopied, setHasCopied] = useState(false)
  const onCopy = useCallback(() => {
    const didCopy = copy(value)
    setHasCopied(didCopy)
  }, [value])
  useEffect(() => {
    if (hasCopied) {
      const timeoutId = setTimeout(() => {
        setHasCopied(false)
      }, timeout)
      return () => {
        window.clearTimeout(timeoutId)
      }
    }
  }, [timeout, hasCopied])

  return { hasCopied, onCopy }
}
