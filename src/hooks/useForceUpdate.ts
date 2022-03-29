import { useReducer } from 'react'

export function useForceUpdate() {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0)
  return forceUpdate
}
