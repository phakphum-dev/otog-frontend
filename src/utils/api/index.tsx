import axios, { AxiosError, AxiosInstance } from 'axios'
import nookies from 'nookies'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { onError, errorToast } from '../hooks/useError'
import { getServerSideColorMode } from '@src/theme/ColorMode'
import { UseToastOptions } from '@chakra-ui/toast'

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
          //  TODO: make thie 403
          if (
            err.response?.status === 401 &&
            originalRequest.url === 'auth/refresh/token'
          ) {
            nookies.set(context, 'accessToken', '', { maxAge: -1, path: '/' })
            this.onLogout()
            errorToast({
              title: 'เซสชันหมดอายุ',
              description: 'กรุณาลงชื่อเข้าใช้อีกครั้ง',
              status: 'info',
              isClosable: true,
            })
            return Promise.reject(err)
          }

          if (err.response?.status === 401) {
            await this.refreshToken(context)
            return this.axiosInstance(originalRequest)
          }
        }
        onError(error)
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
      const { accessToken, user } = response.data
      const { 'set-cookie': refreshToken } = response.headers
      if (context) {
        context.req.headers.cookie = `accessToken=${accessToken}; ${refreshToken}`
        context.res.setHeader('Set-cookie', [
          refreshToken,
          `accessToken=${accessToken}; Path=/`,
        ])
      } else {
        nookies.set(null, 'accessToken', accessToken)
      }
      return user
    }
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

  async onLogout() {}
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // console.log('before req', context.req.headers)
  // console.log('before res', context.res.getHeader('set-cookie'))
  const colorModeProps = await getServerSideColorMode(context)
  const client = new ApiClient(context)
  try {
    const { accessToken } = nookies.get(context)
    if (accessToken) {
      const user = await client.refreshToken(context)
      return { props: { ...(user && { user }), ...colorModeProps } }
    }
  } catch (e) {
    if (e.isAxiosError) {
      const error = e as AxiosError
      // TODO: change to 403
      if (error.response?.status === 401) {
        const errorToast: UseToastOptions = {
          title: 'เซสชันหมดอายุ',
          description: 'กรุณาลงชื่อเข้าใช้อีกครั้ง',
          status: 'info',
          isClosable: true,
        }
        return {
          props: { user: null, error: errorToast, ...colorModeProps },
        }
      }
    }
    console.log(e)
  } finally {
    // console.log('after req', context.req.headers)
    // console.log('after res', context.res.getHeader('set-cookie'))
  }
  return { props: colorModeProps }
}

export { API_HOST, ApiClient }
