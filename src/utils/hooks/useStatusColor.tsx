import { useColorModeValue } from '@chakra-ui/color-mode'
import { Status, Submission } from '@src/utils/api/Submission'

export function useStatusColor(
  submission: Submission | undefined | null,
  exceptReject: boolean = false
) {
  const acceptColor = useColorModeValue('accept.50', 'accept.900')
  const rejectColor = useColorModeValue('reject.50', 'reject.900')
  if (!submission) {
    return undefined
  }
  if (submission.status === 'accept') {
    return acceptColor
  } else if (!exceptReject && submission.status === 'reject') {
    return rejectColor
  }
  return undefined
}

export function isGraded(submission: Submission | undefined) {
  const status = submission?.status
  return status === 'accept' || status === 'reject'
}

export function isGrading(submission: Submission | undefined) {
  const status = submission?.status
  return status === 'waiting' || status === 'grading'
}
