import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import nookies from 'nookies'
import { ParsedUrlQuery } from 'querystring'

import { UseToastOptions } from '@chakra-ui/toast'

import { API_HOST, API_HOST_SSR, isProduction, isServer } from '@src/config'
import { getErrorToast } from '@src/hooks/useError'
import { getColorMode } from '@src/theme/ColorMode'
import { ColorModeProps } from '@src/theme/ColorMode'
import { AuthRes } from '@src/user/types'

export const Axios = axios.create({
  baseURL: isServer ? API_HOST : API_HOST_SSR,
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
      baseURL: isServer ? API_HOST : API_HOST_SSR,
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
        if (error.isAxiosError) {
          error = error as AxiosError
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
                .catch((e: any) => {
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
              } catch (e: any) {
                this.processQueue(e)
                // remove token if failed to refresh token
                if (e.isAxiosError) {
                  if (e.response?.status === 403) {
                    this.removeToken(context)
                    this.updateOnLogout()
                    return Promise.reject(e)
                  }
                }
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
          cookie: `RID=${refreshToken}; HttpOnly ${
            isProduction ? '; Secure' : ''
          }`,
        }),
      },
    })
    if (response.status === 200) {
      const { accessToken } = response.data
      const { 'set-cookie': refreshToken } = response.headers
      if (context) {
        // set request header for retrying on original request
        context.req.headers.cookie = `accessToken=${accessToken}; ${refreshToken}`

        // set response header to set new token on client-side
        context.res.setHeader('Set-cookie', refreshToken)
      }
      this.setNewToken(accessToken, context)
      return accessToken
    }
  }

  setNewToken(accessToken: string, context: Context | null = null) {
    nookies.set(context, 'accessToken', accessToken, { path: '/' })
  }

  removeToken(context: Context | null = null) {
    nookies.destroy(context, 'accessToken', { path: '/' })
    nookies.destroy(context, 'RID', { path: '/' })
  }

  processQueue(error: any) {
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
  getAccessToken() {
    return nookies.get(null).accessToken
  }
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
  const { props } = await getServerSideCookies(context)
  const client = new HttpClient(context)
  try {
    const initialData = await callback(client)
    const { accessToken = null } = nookies.get(context)
    return {
      props: { ...props, ...initialData, accessToken },
    }
  } catch (error: any) {
    const errorToast = getErrorToast(error)
    console.error(error?.toJSON() ?? error)
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
