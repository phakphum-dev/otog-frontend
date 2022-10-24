import { PropsWithChildren, useEffect, useState } from 'react'

export type ClientOnlyProps = PropsWithChildren<{
  fallback?: React.ReactNode
}>

export const ClientOnly = ({ children, fallback = null }: ClientOnlyProps) => {
  const [show, setShow] = useState(false)
  useEffect(() => {
    setShow(true)
  }, [])
  return <>{show ? children : fallback}</>
}
