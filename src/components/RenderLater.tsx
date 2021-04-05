import { PropsWithChildren, useEffect, useState } from 'react'

export function RenderLater(props: PropsWithChildren<{ delay: number }>) {
  const { children, delay = 0 } = props
  const [show, setShow] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true)
    }, delay)
    return () => {
      clearTimeout(timeout)
    }
  }, [])
  return show ? <>{children}</> : null
}
