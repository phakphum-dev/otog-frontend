import { HttpClient } from '@src/context/HttpClient'
import { SubmissionWithProblem } from '@src/submission/types'

export async function submitContestProblem(
  client: HttpClient,
  problemId: number,
  contestId: number,
  file: File,
  language: string
) {
  const formData = new FormData()
  formData.set('sourceCode', file)
  formData.set('language', language)
  formData.set('contestId', `${contestId}`)
  return client.post<SubmissionWithProblem>(
    `submission/problem/${problemId}`,
    formData
  )
}
