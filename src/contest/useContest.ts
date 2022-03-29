import useSWR from 'swr'

import { Contest, ContestScoreboard } from './types'

export function useCurrentContest(initialContest?: Contest | null) {
  return useSWR<Contest | null>('contest/now', { initialData: initialContest })
}

export function useContest(contestId: number | undefined) {
  return useSWR<Contest>(contestId ? `contest/${contestId}` : null)
}

export function useContests() {
  return useSWR<Contest[]>('contest')
}

export function useContestScoreboard(contestId: number) {
  return useSWR<ContestScoreboard>(`contest/${contestId}/scoreboard`)
}
