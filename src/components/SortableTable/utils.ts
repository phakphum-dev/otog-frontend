import { ProblemWithSubmission } from '@src/problem/types'
import { Submission } from '@src/submission/types'

export type SortProblemFunction = (
  problem1: ProblemWithSubmission,
  problem2: ProblemWithSubmission
) => number

// default is ascending
export const problemSortFuncs: Record<string, SortProblemFunction> = {
  id: (p1, p2) => p1.id - p2.id,
  status: (p1, p2) => {
    if (p1.show === p2.show) {
      return p1.id - p2.id
    }
    return Number(p1.show) - Number(p2.show)
  },
  passed: (p1, p2) => {
    if (p1.passedCount === p2.passedCount) {
      return p1.id - p2.id
    }
    return p1.passedCount - p2.passedCount
  },
  sent: (p1, p2) => {
    const val1 = getSubmissionValue(p1.submission)
    const val2 = getSubmissionValue(p2.submission)
    if (val1 === val2) {
      return p1.id - p2.id
    }
    return val1 - val2
  },
}

function getSubmissionValue(submission: Submission | null) {
  if (submission === null) {
    return 0
  }
  if (submission.status === 'accept') {
    return 3
  }
  if (submission.status === 'reject') {
    return 2
  }
  return 1
}
