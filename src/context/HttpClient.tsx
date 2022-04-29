import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import * as cookie from 'cookie'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import nookies from 'nookies'
import { ParsedUrlQuery } from 'querystring'

import { UseToastOptions } from '@chakra-ui/toast'

import {
  API_HOST,
  API_HOST_SSR,
  OFFLINE_MODE,
  isProduction,
  isServer,
} from '@src/config'
import { getErrorToast } from '@src/hooks/useErrorToast'
import { getColorMode } from '@src/theme/ColorMode'
import { ColorModeProps } from '@src/theme/ColorMode'
import { AuthRes } from '@src/user/types'
import { omit } from '@src/utils/omit'
import { serializeCookies } from '@src/utils/serializeCookie'

const secure = !OFFLINE_MODE && isProduction

export const Axios = axios.create({
  baseURL: isServer ? API_HOST_SSR : API_HOST,
  withCredentials: true,
})

// Axios.interceptors.request.use(
//   (request) => {
//     console.log('request :', request.url, request.headers)
//     return request
//   },
//   (error) => Promise.reject(error)
// )
// Axios.interceptors.response.use(
//   (response) => {
//     console.log(
//       'response :',
//       response.config.url,
//       response.headers,
//       response.data
//     )
//     return response
//   },
//   (error) => Promise.reject(error)
// )

class HttpClient {
  axiosInstance: AxiosInstance
  isRefreshing = false
  failedQueue: {
    resolve: (value?: any | PromiseLike<any>) => void
    reject: (reason?: any) => void
  }[] = []

  constructor(context: Context | null) {
    this.axiosInstance = axios.create({
      baseURL: isServer ? API_HOST_SSR : API_HOST,
      withCredentials: true,
    })

    this.axiosInstance.interceptors.request.use(
      async (request) => {
        // always request to server with accessToken if exists
        const { accessToken } = nookies.get(context)
        if (accessToken) {
          request.headers.Authorization = `Bearer ${accessToken}`
        }

        // console.log('request :', request.url, request.headers)
        return request
      },
      (error) => Promise.reject(error)
    )

    this.axiosInstance.interceptors.response.use(
      (response) => {
        // console.log(
        //   'response :',
        //   response.config.url,
        //   response.headers,
        //   response.data
        // )
        return response
      },
      async (error) => {
        if (axios.isAxiosError(error)) {
          const originalRequest = error.config
          // console.log(
          //   'error response :',
          //   err.response?.status,
          //   originalRequest?.url
          // )

          if (error.response?.status === 401) {
            if (this.isRefreshing) {
              return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject })
              })
                .then(() => {
                  return this.axiosInstance(originalRequest)
                })
                .catch((e: unknown) => {
                  return Promise.reject(e)
                })
            }

            // try refresh token on every unauthorized response if accessToken exists
            const { accessToken } = nookies.get(context)
            if (accessToken) {
              try {
                this.isRefreshing = true
                await this.refreshToken(context)
                this.processQueue(null)
                return this.axiosInstance(originalRequest)
              } catch (e: unknown) {
                this.processQueue(e)
                // remove token if failed to refresh token
                if (axios.isAxiosError(e) && e.response?.status === 403) {
                  this.removeToken(context)
                  this.updateOnLogout()
                }
                return Promise.reject(e)
              } finally {
                this.isRefreshing = false
              }
            }

            // if token doesn't exists and not logging in then open up login modal
            else if (error.config.url !== 'auth/login') {
              this.removeToken(context)
              this.openLoginModal()
              return Promise.reject(error)
            }
          }
        }
        return Promise.reject(error)
      }
    )
  }

  async refreshToken(
    context: GetServerSidePropsContext<ParsedUrlQuery> | null
  ) {
    const { accessToken, RID: refreshToken } = nookies.get(context)
    const response = await Axios.get<AuthRes>('auth/refresh/token', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(refreshToken && {
          cookie: cookie.serialize('RID', refreshToken, {
            httpOnly: true,
            secure,
          }),
        }),
      },
    })
    if (response.status === 200) {
      const { accessToken: newAccessToken } = response.data
      if (context) {
        const refreshTokenCookie = response.headers['set-cookie']
        // set response header to set new token on client-side
        context.res.setHeader('set-cookie', [
          refreshTokenCookie,
          cookie.serialize('accessToken', newAccessToken, {
            path: '/',
            secure,
          }),
        ])
        // set request header for retrying on original request
        context.req.headers.cookie = `accessToken=${newAccessToken}; ${refreshTokenCookie}`
      } else {
        this.setAccessToken(newAccessToken)
      }
    }
  }

  getAccessToken() {
    return nookies.get(null).accessToken
  }

  setAccessToken(accessToken: string, context: Context | null = null) {
    nookies.set(context, 'accessToken', accessToken, {
      path: '/',
      secure,
    })
  }

  removeToken(context: Context | null = null) {
    nookies.destroy(context, 'accessToken', { path: '/' })
    nookies.destroy(context, 'RID', { path: '/' })
    if (context) {
      // omit accessToken from default request header
      let cookies = cookie.parse(context.req.headers.cookie as string)
      cookies = omit('RID', cookies)
      cookies = omit('accessToken', cookies)
      context.req.headers.cookie = serializeCookies(cookies)
    }
  }

  processQueue(error: unknown) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error)
      } else {
        promise.resolve()
      }
    })
    this.failedQueue = []
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    return (await this.axiosInstance.get<T>(url, config)).data
  }

  async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig) {
    return (await this.axiosInstance.post<T>(url, data, config)).data
  }

  async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig) {
    return (await this.axiosInstance.put<T>(url, data, config)).data
  }

  async patch<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig) {
    return (await this.axiosInstance.patch<T>(url, data, config)).data
  }

  async del<T>(url: string, config?: AxiosRequestConfig) {
    return (await this.axiosInstance.delete<T>(url, config)).data
  }

  // this will be set only on client
  /* eslint-disable @typescript-eslint/no-empty-function */
  openLoginModal() {}
  updateOnLogout() {}
}

export type Context = GetServerSidePropsContext<ParsedUrlQuery>

export type ServerSideProps<T> = CookiesProps &
  (
    | {
        errorToast?: UseToastOptions
      }
    | T
  )

export async function getServerSideFetch<T = any>(
  context: Context,
  callback: (httpClient: HttpClient) => Promise<T>
): Promise<GetServerSidePropsResult<ServerSideProps<T>>> {
  const client = new HttpClient(context)
  try {
    const initialData = await callback(client)
    const { props } = getServerSideCookies(context)
    return {
      props: { ...props, ...initialData },
    }
  } catch (error: any) {
    const errorToast = getErrorToast(error)
    console.error(error?.toJSON?.() ?? error)
    const { props } = getServerSideCookies(context)
    return {
      props: { ...props, errorToast },
    }
  }
}

export interface CookiesProps extends ColorModeProps {
  accessToken: string | null
}

export const getServerSideCookies = (context: Context) => {
  const colorModeCookie = getColorMode(context)
  const { accessToken = null } = nookies.get(context)
  return { props: { accessToken, colorModeCookie } }
}

export { HttpClient }
