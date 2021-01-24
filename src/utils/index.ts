import { useCallback, useState } from 'react'

export function useToggle(initialValue: boolean = false) {
  const [isOpen, setOpen] = useState(initialValue)
  const onToggle = useCallback(() => {
    setOpen((prevState) => !prevState)
  }, [])
  return { isOpen, onToggle }
}
