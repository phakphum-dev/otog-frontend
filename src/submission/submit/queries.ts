import { client } from '@src/api'
import { SubmissionWithProblem } from '@src/submission/types'

export async function submitProblem(
  problemId: number,
  file: File,
  language: string
) {
  return client
    .url(`submission/problem/${problemId}`)
    .formData({ sourceCode: file, language: language })
    .post()
    .json<SubmissionWithProblem>()
}
