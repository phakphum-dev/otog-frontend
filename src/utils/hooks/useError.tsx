import { createStandaloneToast, useToast } from '@chakra-ui/toast'

export const errorToast = createStandaloneToast()

export function onError(e: any) {
  const error = new Error(e)
  errorToast({
    title: error.name,
    description: error.message,
    status: 'error',
    isClosable: true,
  })
}

export function useError() {
  const toast = useToast()
  const onError = (e: any) => {
    const error = new Error(e)
    toast({
      title: error.name,
      description: error.message,
      status: 'error',
      isClosable: true,
    })
  }
  return [onError, toast]
}
