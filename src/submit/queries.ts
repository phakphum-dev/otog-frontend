import { HttpClient } from '@src/context/HttpClient'
import { SubmissionWithProblem } from '@src/submission/useSubmission'

export async function submitProblem(
  client: HttpClient,
  problemId: number,
  file: File,
  language: string
) {
  const formData = new FormData()
  formData.set('sourceCode', file)
  formData.set('language', language)
  return client.post<SubmissionWithProblem>(
    `submission/problem/${problemId}`,
    formData
  )
}
