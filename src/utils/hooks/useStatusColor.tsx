import { useColorModeValue } from '@chakra-ui/color-mode'
import { Status } from '../api/Submission'

export function useStatusColor(
  status?: Status | null,
  exceptReject: boolean = false
) {
  const acceptColor = useColorModeValue('accept.50', 'accept.900')
  const rejectColor = useColorModeValue('reject.50', 'reject.900')
  if (status === 'accept') {
    return acceptColor
  } else if (!exceptReject && status === 'reject') {
    return rejectColor
  }
  return undefined
}

export function isGraded(status: Status) {
  if (status === 'accept' || status === 'reject') {
    return true
  }
  return false
}
