import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import nookies from 'nookies'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { onError, errorToast } from '../hooks/useError'
import { getServerSideColorMode } from '@src/theme/ColorMode'
import { UseToastOptions } from '@chakra-ui/toast'
import jwtDecode, { JwtPayload } from 'jwt-decode'

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
          //   'error request :',
          //   err.response?.status,
          //   originalRequest?.url
          // )
          //  TODO: make thie 403
          if (
            err.response?.status === 401 &&
            originalRequest.url === 'auth/refresh/token'
          ) {
            nookies.destroy(context, 'accessToken', { path: '/' })
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
        context.req.headers.cookie = `accessToken=${accessToken}; ${refreshToken}`
        context.res.setHeader('Set-cookie', [
          refreshToken,
          `accessToken=${accessToken}; Path=/`,
        ])
      } else {
        nookies.set(null, 'accessToken', accessToken)
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

  async onLogout() {}
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // console.log('before req', context.req.headers)
  // console.log('before res', context.res.getHeader('set-cookie'))
  const colorModeProps = await getServerSideColorMode(context)

  const { accessToken = null } = nookies.get(context)
  return { props: { accessToken, ...colorModeProps } }

  // const client = new ApiClient(context)
  // try {
  //   const { accessToken } = nookies.get(context)
  //   if (accessToken) {
  //     const newToken = await client.refreshToken(context)
  //     return {
  //       props: { accessToken: newToken, ...colorModeProps },
  //     }
  //   }
  // } catch (e) {
  //   if (e.isAxiosError) {
  //     const error = e as AxiosError
  //     // TODO: change to 403
  //     if (error.response?.status === 401) {
  //       const errorToast: UseToastOptions = {
  //         title: 'เซสชันหมดอายุ',
  //         description: 'กรุณาลงชื่อเข้าใช้อีกครั้ง',
  //         status: 'info',
  //         isClosable: true,
  //       }
  //       return {
  //         props: { accessToken: null, error: errorToast, ...colorModeProps },
  //       }
  //     }
  //   }
  //   console.log(e)
  // } finally {
  //   // console.log('after req', context.req.headers)
  //   // console.log('after res', context.res.getHeader('set-cookie'))
  // }
  // return { props: colorModeProps }
}

export { API_HOST, ApiClient }
