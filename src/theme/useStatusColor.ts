import { Submission } from '@src/submission/types'

export function getBgColor(submission: Submission | undefined | null) {
  if (submission) {
    if (submission.status === 'accept') {
      return 'bg-accept-50 dark:bg-accept-900'
    }
  }
  return ''
}

export function getBgHoveredColor(submission: Submission | undefined | null) {
  if (submission) {
    if (submission.status === 'accept') {
      return 'cursor-pointer hover:bg-accept-100 active:bg-accept-200 dark:hover:bg-accept-800 active:dark:bg-accept-700'
    } else {
      return 'cursor-pointer hover:bg-black/4 active:bg-black/8 dark:hover:bg-white/4 active:dark:bg-white/8'
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
