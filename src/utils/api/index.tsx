import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import nookies from 'nookies'
import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { errorToast, getErrorToast } from '@src/utils/hooks/useError'
import { getColorMode } from '@src/theme/ColorMode'
import { ColorModeProps } from '@src/theme/ColorMode'
import { AuthRes } from './AuthProvider'
import { UseToastOptions } from '@chakra-ui/toast'
import { API_HOST } from '@src/utils/config'

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
          const axiosError = error as AxiosError
          const originalRequest = axiosError.config
          // console.log(
          //   'error response :',
          //   err.response?.status,
          //   originalRequest?.url
          // )

          if (axiosError.response?.status === 401) {
            if (this.isRefreshing) {
              return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject })
              })
                .then(() => {
                  return this.axiosInstance(originalRequest)
                })
                .catch((error) => {
                  return Promise.reject(error)
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
                  const error = e as AxiosError
                  if (error.response?.status === 403) {
                    nookies.destroy(context, 'accessToken', { path: '/' })
                    this.removeToken()
                    // TODO: move this to global to display only once per page
                    errorToast(getErrorToast(error))
                    return Promise.reject(error)
                  }
                }
              } finally {
                this.isRefreshing = false
              }
            }
            // if token doesn't exists and not logging in then open up login modal
            else if (axiosError.config.url !== 'auth/login') {
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
        // TODO: add secure flag
        ...(refreshToken && { cookie: `RID=${refreshToken}; HttpOnly` }),
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

export async function getServerSideFetch<T = any>(
  key: string | ((apiClient: ApiClient) => Promise<T>),
  context: Context
): Promise<{
  props: CookiesProps & {
    initialData?: T
    error?: UseToastOptions
  }
}> {
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
    return {
      props: { ...props, initialData, accessToken },
    }
  } catch (e) {
    if (e.isAxiosError) {
      const error = e as AxiosError
      if (error.response?.status === 401) {
        const errorToast = getErrorToast(error)
        return {
          props: {
            ...props,
            accessToken: null,
            error: errorToast,
          },
        }
      }
    }
    const errorToast = getErrorToast(e)
    return {
      props: { ...props, error: errorToast },
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
