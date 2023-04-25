import { client } from '@src/api'
import { Contest, CreateContest } from '@src/contest/types'
import { Problem } from '@src/problem/types'

export async function createContest(contest: CreateContest) {
  return client.url('contest').post(contest).json<Contest>()
}

export async function updateContest(contestId: number, contest: CreateContest) {
  return client.url(`contest/${contestId}`).put(contest).json<Contest>()
}

export async function deleteContest(contestId: number) {
  return client.url(`contest/${contestId}`).delete().json<Contest>()
}

export async function toggleContestProblem(
  contestId: number,
  problemId: number,
  show: boolean
) {
  return client
    .url(`contest/${contestId}`)
    .patch({ problemId, show })
    .json<Problem>()
}
