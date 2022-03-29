import { Contest, CreateContest } from '@src/contest/types'
import { HttpClient } from '@src/context/HttpClient'
import { Problem } from '@src/problem/types'

export async function createContest(
  client: HttpClient,
  contest: CreateContest
) {
  return client.post<Contest, CreateContest>('contest', contest)
}

export async function updateContest(
  client: HttpClient,
  contestId: number,
  contest: CreateContest
) {
  return client.put<Contest>(`contest/${contestId}`, contest)
}

export async function deleteContest(client: HttpClient, contestId: number) {
  return client.del<Contest>(`contest/${contestId}`)
}

export async function toggleContestProblem(
  client: HttpClient,
  contestId: number,
  problemId: number,
  show: boolean
) {
  return client.patch<Problem>(`contest/${contestId}`, {
    problemId,
    show,
  })
}
