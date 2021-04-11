import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import nookies from 'nookies'
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next'
import { ParsedUrlQuery } from 'querystring'
import { errorToast, getErrorToast } from '@src/utils/hooks/useError'
import { getColorMode } from '@src/theme/ColorMode'
import { ColorModeProps } from '@src/theme/ColorMode'
import { UseToastOptions } from '@chakra-ui/toast'
import { API_HOST, isProduction } from '@src/utils/config'
import { AuthRes } from './User'

export const Axios = axios.create({
  baseURL: API_HOST,
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

class ApiClient {
  axiosInstance: AxiosInstance
  isRefreshing: boolean = false
  failedQueue: {
    resolve: (value?: any | PromiseLike<any>) => void
    reject: (reason?: any) => void
  }[] = []

  constructor(context: GetServerSidePropsContext<ParsedUrlQuery> | null) {
    this.axiosInstance = axios.create({
      baseURL: API_HOST,
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
                .catch((e) => {
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
              } catch (e) {
                this.processQueue(e)
                // remove token if failed to refresh token
                if (e.isAxiosError) {
                  e = e as AxiosError
                  if (e.response?.status === 403) {
                    nookies.destroy(context, 'accessToken', { path: '/' })
                    this.removeToken()
                    // TODO: move this to global to display only once per page
                    errorToast(getErrorToast(e))
                    return Promise.reject(e)
                  }
                }
              } finally {
                this.isRefreshing = false
              }
            }
            // if token doesn't exists and not logging in then open up login modal
            else if (error.config.url !== 'auth/login') {
              this.removeToken()
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
        nookies.set(context, 'accessToken', accessToken, { path: '/' })
      } else {
        // set new token on client-side
        this.setNewToken(accessToken)
      }
      return accessToken
    }
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

  async post<D, T>(url: string, data?: D, config?: AxiosRequestConfig) {
    return (await this.axiosInstance.post<T>(url, data, config)).data
  }

  async put<D, T>(url: string, data?: D, config?: AxiosRequestConfig) {
    return (await this.axiosInstance.put<T>(url, data, config)).data
  }

  async patch<D, T>(url: string, data?: D, config?: AxiosRequestConfig) {
    return (await this.axiosInstance.patch<T>(url, data, config)).data
  }

  async del(url: string, config?: AxiosRequestConfig) {
    await this.axiosInstance.delete(url, config)
  }

  removeToken() {}
  setNewToken(newToken: string) {}
  openLoginModal() {}
}

export type Context = GetServerSidePropsContext<ParsedUrlQuery>

export const getCookies = (context: Context) => nookies.get(context)

export type ServerSideProps<T> = CookiesProps & {
  initialData?: T
  errorToast?: UseToastOptions
}

export async function getServerSideFetch<T = any>(
  key: string | ((apiClient: ApiClient) => Promise<T>),
  context: Context
): Promise<GetServerSidePropsResult<ServerSideProps<T>>> {
  const { props } = await getServerSideProps(context)
  const api = new ApiClient(context)
  try {
    var initialData: T
    if (typeof key === 'string') {
      initialData = await api.get<T>(key)
    } else {
      initialData = await key(api)
    }
    const { accessToken = null } = nookies.get(context)
    if (!initialData) {
      return { notFound: true }
    }
    return {
      props: { ...props, initialData, accessToken },
    }
  } catch (error) {
    const errorToast = getErrorToast(error)
    console.log(error)
    return {
      props: { ...props, errorToast },
    }
  }
}

export interface CookiesProps extends ColorModeProps {
  accessToken: string | null
}

export const getServerSideProps = (context: Context) => {
  const colorModeCookie = getColorMode(context)
  const { accessToken = null } = nookies.get(context)
  return { props: { accessToken, colorModeCookie } }
}

export { API_HOST, ApiClient }
