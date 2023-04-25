import { client } from '@src/api'
import { Problem, Testcase } from '@src/problem/types'

export type CreateProblem = Pick<
  Problem,
  'name' | 'score' | 'timeLimit' | 'memoryLimit' | 'case'
>

// TODO: type safe
export async function createProblem(formData: FormData) {
  return client
    .url('problem')
    .formData(Object.fromEntries(formData))
    .post()
    .json<Problem>()
}

export async function updateProblem(problemId: number, formData: FormData) {
  return client
    .url(`problem/${problemId}`)
    .formData(Object.fromEntries(formData))
    .put()
    .json<Problem>()
}

export async function toggleProblem(problemId: number, show: boolean) {
  return client.url(`problem/${problemId}`).patch({ show }).json<Problem>()
}

export async function deleteProblem(problemId: number) {
  return client.url(`problem/${problemId}`).delete().json<Problem>()
}

export async function updateProblemExamples(
  problemId: number,
  examples: Testcase[]
) {
  return client
    .url(`problem/${problemId}/examples`)
    .put(examples)
    .json<Problem>()
}
