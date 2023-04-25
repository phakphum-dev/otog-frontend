import useSWR from 'swr'

import { Contest, ContestPrize, ContestScoreboard } from './types'

import { client } from '@src/api'
import { SubmissionWithProblem } from '@src/submission/types'

export async function getCurrentContest() {
  return client
    .get('contest/now')
    .json<{ currentContest: Contest | null }>()
    .then((r) => r.currentContest)
}

export function useCurrentContest() {
  return useSWR('contest/now', getCurrentContest)
}

export function keyContest(contestId: number) {
  return `contest/${contestId}`
}

export async function getContest(contestId: number | undefined) {
  return client.get(`contest/${contestId}`).json<Contest>()
}

export function useContest(contestId: number | undefined) {
  return useSWR(contestId ? `contest/${contestId}` : null, () =>
    getContest(contestId)
  )
}

export async function getContests() {
  return client.get('contest').json<Contest[]>()
}

export function useContests() {
  return useSWR('contest', getContests)
}

export function keyContestScoreboard(contestId: number) {
  return `contest/${contestId}/scoreboard`
}

export async function getContestScoreboard(contestId: number) {
  return client.get(keyContestScoreboard(contestId)).json<ContestScoreboard>()
}

export function useContestScoreboard(contestId: number) {
  return useSWR(keyContestScoreboard(contestId), () =>
    getContestScoreboard(contestId)
  )
}

export function keyContestPrize(contestId: number) {
  return `contest/${contestId}/prize`
}

export function getContestPrize(contestId: number) {
  return client.get(keyContestPrize(contestId)).json<ContestPrize>()
}

export function useContestPrize(contestId: number) {
  return useSWR(keyContestPrize(contestId), () => getContestPrize(contestId))
}

export async function submitContestProblem(
  problemId: number,
  contestId: number,
  file: File,
  language: string
) {
  const formData = new FormData()
  formData.set('sourceCode', file)
  formData.set('language', language)
  formData.set('contestId', `${contestId}`)
  return client
    .url(`submission/problem/${problemId}`)
    .post(formData)
    .json<SubmissionWithProblem>()
}
