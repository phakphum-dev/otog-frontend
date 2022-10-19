import { Contest, CreateContest } from '@src/contest/types'
import { http } from '@src/context/HttpClient'
import { Problem } from '@src/problem/types'

export async function createContest(contest: CreateContest) {
  return http.post<Contest, CreateContest>('contest', contest)
}

export async function updateContest(contestId: number, contest: CreateContest) {
  return http.put<Contest>(`contest/${contestId}`, contest)
}

export async function deleteContest(contestId: number) {
  return http.del<Contest>(`contest/${contestId}`)
}

export async function toggleContestProblem(
  contestId: number,
  problemId: number,
  show: boolean
) {
  return http.patch<Problem>(`contest/${contestId}`, {
    problemId,
    show,
  })
}
