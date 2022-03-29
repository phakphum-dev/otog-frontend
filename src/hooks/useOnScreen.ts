import { useCallback, useMemo, useState } from 'react'

export const useOnScreen = (rootMargin = '0px') => {
  const [isIntersecting, setIntersecting] = useState(false)
  const resetIntersecting = () => setIntersecting(false)
  const isClient = !!process.browser

  const observer = useMemo(
    () =>
      isClient &&
      new IntersectionObserver(
        ([entry]) => setIntersecting(entry.isIntersecting),
        { rootMargin, threshold: 0 }
      ),
    [isClient, rootMargin]
  )

  const ref = useCallback(
    (node: Element | null) => {
      if (observer) {
        observer.disconnect()
        if (node) {
          observer.observe(node)
        }
      }
    },
    [observer]
  )

  return { ref, isIntersecting, resetIntersecting }
}
