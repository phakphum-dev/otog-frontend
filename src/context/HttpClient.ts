import wretch, { FetchLike } from 'wretch'
import { createStore } from 'zustand'

import {
  API_HOST,
  API_HOST_SSR,
  OFFLINE_MODE,
  isProduction,
  isServer,
} from '@src/config'

const secure = !OFFLINE_MODE && isProduction

export const tokenStore = createStore<{ accessToken: string | null }>(() => ({
  accessToken: null,
}))
const { getState, setState } = tokenStore
export const getAccessToken = () => {
  return getState().accessToken
}
export const setAccessToken = (token: string | null) => {
  setState({ accessToken: token })
}

const authMiddleware =
  (next: FetchLike): FetchLike =>
  (url, opts) => {
    const token = getAccessToken()
    if (token) {
      return next(url, {
        ...opts,
        headers: {
          ...(opts.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      })
    }
    return next(url, opts)
  }

export const api = wretch(isServer ? API_HOST_SSR : API_HOST, { secure })
  .middlewares([authMiddleware])
  .options({ mode: 'cors' })
// Handle 403 errors
// .resolve((_) => _.forbidden(handle403))
