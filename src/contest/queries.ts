import useSWR from 'swr'

import { Contest, ContestPrize, ContestScoreboard } from './types'

import { http } from '@src/context/HttpClient'
import { SubmissionWithProblem } from '@src/submission/types'

export async function getCurrentContest() {
  return http.get<Contest | null>('contest/now')
}

export function useCurrentContest() {
  return useSWR('contest/now', getCurrentContest)
}

export function keyContest(contestId: number) {
  return `contest/${contestId}`
}

export async function getContest(contestId: number | undefined) {
  return http.get<Contest>(`contest/${contestId}`)
}

export function useContest(contestId: number | undefined) {
  return useSWR(contestId ? `contest/${contestId}` : null, () =>
    getContest(contestId)
  )
}

export async function getContests() {
  return http.get<Contest[]>('contest')
}

export function useContests() {
  return useSWR('contest', getContests)
}

export function keyContestScoreboard(contestId: number) {
  return `contest/${contestId}/scoreboard`
}

export async function getContestScoreboard(contestId: number) {
  return http.get<ContestScoreboard>(keyContestScoreboard(contestId))
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
  return http.get<ContestPrize>(keyContestPrize(contestId))
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
  return http.post<SubmissionWithProblem>(
    `submission/problem/${problemId}`,
    formData
  )
}
