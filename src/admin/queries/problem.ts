import { api } from '@src/context/HttpClient'
import { Problem, Testcase } from '@src/problem/types'

export type CreateProblem = Pick<
  Problem,
  'name' | 'score' | 'timeLimit' | 'memoryLimit' | 'case'
>

// TODO: type safe
export async function createProblem(formData: FormData) {
  return api.url('problem').post(formData).json<Problem>()
}

export async function updateProblem(problemId: number, formData: FormData) {
  return api.url(`problem/${problemId}`).put(formData).json<Problem>()
}

export async function toggleProblem(problemId: number, show: boolean) {
  return api.url(`problem/${problemId}`).patch({ show }).json<Problem>()
}

export async function deleteProblem(problemId: number) {
  return api.url(`problem/${problemId}`).delete().json<Problem>()
}

export async function updateProblemExamples(
  problemId: number,
  examples: Testcase[]
) {
  return api.url(`problem/${problemId}/examples`).put(examples).json<Problem>()
}
