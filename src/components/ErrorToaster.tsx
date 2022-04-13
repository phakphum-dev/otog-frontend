import { useEffect } from 'react'

import { useToast } from '@chakra-ui/react'

import { ErrorToastOptions } from '@src/hooks/useErrorToast'

export interface ErrorToasterProps {
  errorToast: ErrorToastOptions
}
export function ErrorToaster(props: ErrorToasterProps) {
  const { errorToast } = props
  const toast = useToast()
  useEffect(() => {
    if (errorToast) {
      toast(errorToast)
    }
  }, [errorToast, toast])
  return null
}
