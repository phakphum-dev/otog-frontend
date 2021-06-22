import { useDisclosure } from '@chakra-ui/react'

export function useLoading() {
  const {
    isOpen: isLoading,
    onOpen: onLoad,
    onClose: onLoaded,
  } = useDisclosure()
  return { isLoading, onLoad, onLoaded }
}
