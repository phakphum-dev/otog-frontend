import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import nookies from 'nookies'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { errorToast } from '../hooks/useError'
import { getServerSideColorMode } from '@src/theme/ColorMode'
import { Role } from './User'

const API_HOST = process.env.NEXT_PUBLIC_API_HOST

interface UserAuthDTO {
  id: number
  username: string
  showName: string
  role: Role
  rating: number
}

interface AuthResDTO {
  user: UserAuthDTO
  accessToken: string
}

export const Axios = axios.create({
  baseURL: API_HOST,
  withCredentials: true,
})

class ApiClient {
  axiosInstance: AxiosInstance

  constructor(context: GetServerSidePropsContext<ParsedUrlQuery> | null) {
    this.axiosInstance = axios.create({
      baseURL: API_HOST,
      withCredentials: true,
    })

    this.axiosInstance.interceptors.request.use(
      async (request) => {
        // always request to server with accessToken if exists
        const { accessToken, RID: refreshToken } = nookies.get(context)
        if (accessToken) {
          request.headers.Authorization = `Bearer ${accessToken}`
        }

        // refreshToken is required for refreshing accessToken on server-side
        if (refreshToken && context) {
          // TODO: add Secure flag
          request.headers.cookie = `RID=${refreshToken}; HttpOnly`
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
          const err = error as AxiosError
          const originalRequest = err.config
          // console.log(
          //   'error response :',
          //   err.response?.status,
          //   originalRequest?.url
          // )

          if (err.response?.status === 403) {
            this.onSessionEnd()
            return Promise.reject(err)
          }

          // remove token if failed on refresh token
          if (
            err.response?.status === 401 &&
            originalRequest.url === 'auth/refresh/token'
          ) {
            nookies.destroy(context, 'accessToken')
            this.removeToken()
            // TODO: move this to global to display only once per page
            errorToast({
              title: 'เซสชันหมดอายุ',
              description: 'กรุณาลงชื่อเข้าใช้อีกครั้ง',
              status: 'info',
              isClosable: true,
            })
            return Promise.reject(err)
          }

          // try refresh token on every unauthorized response if accessToken exists
          if (err.response?.status === 401) {
            const { accessToken } = nookies.get(context)
            if (accessToken) {
              await this.refreshToken(context)
              return this.axiosInstance(originalRequest)
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
    const response = await this.axiosInstance.get<AuthResDTO>(
      'auth/refresh/token'
    )
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
        this.onRefreshToken(accessToken)
      }
      return accessToken
    }
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

  async del(url: string, config?: AxiosRequestConfig) {
    await this.axiosInstance.delete(url, config)
  }

  removeToken() {}
  onRefreshToken(newToken: string) {}
  onSessionEnd() {}
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const colorModeProps = await getServerSideColorMode(context)
  const { accessToken = null } = nookies.get(context)
  return { props: { accessToken, ...colorModeProps } }
}

export { API_HOST, ApiClient }
