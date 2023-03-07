import axios from 'axios'
import { useTheme } from 'next-themes'
import { useCallback } from 'react'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

export type ErrorToastOptions = {
  title: string
  description?: string
  status?: 'success' | 'error'
  code?: number
}

export function useErrorToast() {
  const { resolvedTheme } = useTheme()
  return useCallback(
    (error: unknown) => {
      const toastData = getErrorData(error)
      if (toastData.status) {
        toast[toastData.status](
          toastData.description ? (
            <div>
              <b>{toastData.title}</b>
              <p>{toastData.description}</p>
            </div>
          ) : (
            toastData.title
          ),
          {
            style: {
              background: resolvedTheme === 'dark' ? '#1A202C' : '#fff',
              color: resolvedTheme === 'dark' ? 'white' : '#1A202C',
            },
          }
        )
      } else {
        toast(
          toastData.description ? (
            <div>
              <b>{toastData.title}</b>
              <p>{toastData.description}</p>
            </div>
          ) : (
            toastData.title
          ),
          {
            style: {
              background: resolvedTheme === 'dark' ? '#1A202C' : '#fff',
              color: resolvedTheme === 'dark' ? 'white' : '#1A202C',
            },
          }
        )
      }
    },
    [resolvedTheme]
  )
}

export function useErrorToaster(errorData: ErrorToastOptions | undefined) {
  const errorToast = useErrorToast()
  useEffect(() => {
    if (errorData) {
      errorToast(errorData)
    }
  }, [errorData, errorToast])
}

export function getErrorData(error: unknown): ErrorToastOptions {
  if (axios.isAxiosError(error)) {
    const url = error.config.url
    switch (error.response?.status) {
      case 401:
        if (url === 'auth/login') {
          return {
            title: 'ลงชื่อเข้าใช้งานไม่สำเร็จ !',
            description: 'ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง',
            status: 'error',
            code: 401,
          }
        }
        return {
          title: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
          status: 'error',
          code: 401,
        }
      case 403:
        if (url === 'auth/refresh/token') {
          return {
            title: 'เซสชันหมดอายุ',
            description: 'กรุณาลงชื่อเข้าใช้อีกครั้ง',
            status: 'error',
            code: 403,
          }
        }
        return {
          title: 'คุณไม่มีสิทธิ์ในการใช้งานส่วนนี้',
          status: 'error',
          code: 403,
        }
      case 409:
        /*eslint-disable no-case-declarations*/
        const message = error.response.data.message
        if (url === 'auth/register') {
          if (message === 'username was taken.') {
            return {
              title: 'ลงทะเบียนไม่สำเร็จ !',
              description: 'ชื่อผู้ใช้นี้ ได้ถูกใช้ไปแล้ว',
              status: 'error',
              code: 409,
            }
          }
          if (message === 'showName was taken.') {
            return {
              title: 'ลงทะเบียนไม่สำเร็จ !',
              description: 'ชื่อที่ใช้แสดงนี้ ได้ถูกใช้ไปแล้ว',
              status: 'error',
              code: 409,
            }
          }
        }
        if (message === 'username was taken.') {
          return {
            title: 'ชื่อผู้ใช้นี้ ได้ถูกใช้ไปแล้ว!',
            status: 'error',
            code: 409,
          }
        }
        return {
          title: 'เกิดข้อมูลซ้ำซ้อน',
          status: 'error',
          code: 409,
        }
      case undefined: {
        return {
          title: 'ไม่สามารถติดต่อกับเซิฟเวอร์ได้',
          status: 'error',
          code: 503,
        }
      }
    }
    return {
      title: error.name,
      description: error.response?.data?.message ?? error.message,
      status: 'error',
      code: error.response?.status,
    }
  }
  const err = new Error(error as any)
  return {
    title: err.name,
    description: err.message,
    status: 'error',
  }
}
