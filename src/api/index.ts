import wretch, { FetchLike } from 'wretch'
import FormDataAddon from 'wretch/addons/formData'
import { createStore } from 'zustand'

import {
  API_HOST,
  API_HOST_SSR,
  OFFLINE_MODE,
  isProduction,
  isServer,
} from '@src/config'
import { AuthRes } from '@src/user/types'

export const secure = !OFFLINE_MODE && isProduction

export const tokenStore = createStore<{ accessToken: string | null }>(() => ({
  accessToken: null,
}))
const { getState, setState, subscribe } = tokenStore
export const getAccessToken = () => {
  return getState().accessToken
}
export const setAccessToken = (token: string | null) => {
  setState({ accessToken: token })
}
export const removeAccessToken = () => {
  setState({ accessToken: null })
}
subscribe(({ accessToken }) => {
  console.log(accessToken && accessToken.at(-1))
})

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

export const api = wretch(isServer ? API_HOST_SSR : API_HOST, {
  secure,
  mode: 'cors',
  credentials: 'include',
})

type Resolve = (value?: unknown) => void
let waiting: null | Resolve[]

export const client = api
  .middlewares([authMiddleware])
  .addon(FormDataAddon)
  .catcher(401, async (_, req) => {
    if (Array.isArray(waiting)) {
      await new Promise((resolve) => {
        waiting!.push(resolve)
      })
    } else {
      waiting = []
      await api
        .auth(`Bearer ${getAccessToken()}`)
        .get('auth/refresh/token')
        .forbidden((e) => {
          throw e
        })
        .json<AuthRes>()
        .then((r) => setAccessToken(r.accessToken))
      waiting.forEach((resolve) => resolve())
      waiting = null
    }
    return req
      .fetch()
      .unauthorized((err) => {
        throw err
      })
      .json()
  })
