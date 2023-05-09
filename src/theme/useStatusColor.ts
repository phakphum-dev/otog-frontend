import { Submission } from '@src/submission/types'

export function getBgColor(
  submission: Submission | undefined | null,
  exceptReject = false
) {
  if (submission) {
    if (submission.status === 'accept') {
      return 'bg-accept-50 dark:bg-accept-900'
    } else if (!exceptReject && submission.status === 'reject') {
      return 'bg-reject-50 dark:bg-reject-900'
    }
  }
  return ''
}

export function isGraded(submission: Submission | undefined) {
  const status = submission?.status
  return status === 'accept' || status === 'reject'
}

export function isGrading(submission: Submission | undefined) {
  const status = submission?.status
  return status === 'waiting' || status === 'grading'
}
