import { ButtonProps } from '@src/ui/Button'
import { ProblemWithSubmission } from './types'
import { ONE_DAY } from '@src/utils/time'

export const filterNames = [
  'total',
  'passed',
  'reject',
  'notSent',
  'today',
] as const
export type Filter = (typeof filterNames)[number]
export const filters: Record<
  Filter,
  {
    filter: (problem: ProblemWithSubmission) => boolean
    colorScheme: ButtonProps['colorScheme']
    label: string
  }
> = {
  total: {
    filter: () => true,
    colorScheme: 'gray',
    label: 'ทั้งหมด',
  },
  passed: {
    filter: (problem: ProblemWithSubmission) =>
      problem.submission?.status === 'accept',
    colorScheme: 'otog-green',
    label: 'ผ่านแล้ว',
  },
  reject: {
    filter: (problem: ProblemWithSubmission) =>
      problem.submission?.status === 'reject',
    colorScheme: 'otog-red',
    label: 'ยังไม่ผ่าน',
  },
  notSent: {
    filter: (problem: ProblemWithSubmission) => !problem.submission?.id,
    colorScheme: 'otog-orange',
    label: 'ยังไม่ส่ง',
  },
  today: {
    filter: (problem: ProblemWithSubmission) =>
      problem.show &&
      Date.now() - new Date(problem.recentShowTime).getTime() < ONE_DAY,
    colorScheme: 'otog-blue',
    label: 'โจทย์วันนี้',
  },
}
