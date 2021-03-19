import axios, { AxiosError, AxiosInstance } from 'axios'
import nookies from 'nookies'
import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { onError, errorToast } from '../hooks/useError'

const API_HOST = process.env.NEXT_PUBLIC_API_HOST

interface UserAuthDTO {
  id: number
  username: string
  showName: string
  role: string
  rating: number
}

interface AuthResDTO {
  user: UserAuthDTO
  accessToken: string
}

class ApiClient {
  axiosInstance: AxiosInstance
  // accessToken: string

  constructor(context: GetServerSidePropsContext<ParsedUrlQuery> | null) {
    this.axiosInstance = axios.create({
      baseURL: API_HOST,
      withCredentials: true,
    })

    this.axiosInstance.interceptors.request.use(
      async (request) => {
        const { accessToken, RID: refreshToken } = nookies.get(context)
        if (accessToken) {
          request.headers.Authorization = `Bearer ${accessToken}`
        }
        if (refreshToken && context) {
          request.headers.cookie = `RID=${refreshToken}`
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
          //   'error request :',
          //   err.response?.status,
          //   originalRequest?.url
          // )
          if (
            err.response?.status === 401 &&
            originalRequest.url === 'auth/refresh/token'
          ) {
            errorToast({
              title: 'เซสชันหมดอายุ',
              description: 'กรุณาลงชื่อเข้าใช้อีกครั้ง',
              status: 'info',
              isClosable: true,
            })
            return Promise.reject(err)
          }

          if (err.response?.status === 401) {
            const response = await this.axiosInstance.get<AuthResDTO>(
              'auth/refresh/token'
            )
            if (response.status === 200) {
              if (context) {
                const { accessToken } = response.data
                const refreshToken = response.headers['set-cookie']
                context.req.headers.cookie = `accessToken=${accessToken}; ${refreshToken}`
                context.res.setHeader('set-cookie', [
                  `accessToken=${accessToken}`,
                  refreshToken,
                ])
              }
              return this.axiosInstance(originalRequest)
            } else {
              nookies.set(null, 'accessToken', response.data.accessToken)
            }
          }
        }
        onError(error)
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, params?: any) {
    return (await this.axiosInstance.get<T>(url, { params })).data
  }

  async post<D, T>(url: string, data?: D) {
    return (await this.axiosInstance.post<T>(url, data)).data
  }

  async put<D, T>(url: string, data?: D) {
    return (await this.axiosInstance.put<T>(url, data)).data
  }

  async del(url: string) {
    await this.axiosInstance.delete(url)
  }
}

export { API_HOST, ApiClient }
