import { http } from '@src/context/HttpClient'
import { SubmissionWithProblem } from '@src/submission/types'

export async function submitProblem(
  problemId: number,
  file: File,
  language: string
) {
  const formData = new FormData()
  formData.set('sourceCode', file)
  formData.set('language', language)
  return http.post<SubmissionWithProblem>(
    `submission/problem/${problemId}`,
    formData
  )
}
