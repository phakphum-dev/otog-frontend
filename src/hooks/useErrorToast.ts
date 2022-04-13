import axios from 'axios'
import { useCallback } from 'react'

import { UseToastOptions, useToast } from '@chakra-ui/toast'

export type ErrorToastOptions = UseToastOptions & {
  code: number | null
}

export function useErrorToast() {
  const toast = useToast()
  const onError = useCallback(
    (error: unknown) => {
      const toastData = getErrorToast(error)
      if (!toastData.id || !toast.isActive(toastData.id)) {
        toast(toastData)
      }
    },
    [toast]
  )
  return { onError, toast }
}

export function getErrorToast(error: any): ErrorToastOptions {
  if (axios.isAxiosError(error)) {
    const url = error.config.url
    switch (error.response?.status) {
      case 401:
        if (url === 'auth/login') {
          return {
            title: 'ลงชื่อเข้าใช้งานไม่สำเร็จ !',
            description: 'ชื่อผู้ใช้ หรือ รหัสผ่าน ไม่ถูกต้อง',
            status: 'error',
            isClosable: true,
            code: 401,
            id: 4010,
          }
        }
        return {
          title: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
          status: 'warning',
          duration: 2000,
          code: 401,
          id: 4011,
        }
      case 403:
        if (url === 'auth/refresh/token') {
          return {
            title: 'เซสชันหมดอายุ',
            description: 'กรุณาลงชื่อเข้าใช้อีกครั้ง',
            status: 'info',
            isClosable: true,
            code: 403,
            id: 4030,
          }
        }
        return {
          title: 'คุณไม่มีสิทธิ์ในการใช้งานส่วนนี้',
          status: 'error',
          duration: 2000,
          code: 403,
          id: 4031,
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
              isClosable: true,
              code: 409,
              id: 4090,
            }
          }
          if (message === 'showName was taken.') {
            return {
              title: 'ลงทะเบียนไม่สำเร็จ !',
              description: 'ชื่อที่ใช้แสดงนี้ ได้ถูกใช้ไปแล้ว',
              status: 'error',
              isClosable: true,
              code: 409,
              id: 4091,
            }
          }
        }
        if (message === 'username was taken.') {
          return {
            title: 'ชื่อผู้ใช้นี้ ได้ถูกใช้ไปแล้ว!',
            status: 'error',
            isClosable: true,
            code: 409,
            id: 4092,
          }
        }
        return {
          title: 'เกิดข้อมูลซ้ำซ้อน',
          status: 'error',
          isClosable: true,
          code: 409,
          id: 4093,
        }
      case undefined: {
        return {
          title: 'ไม่สามารถติดต่อกับเซิฟเวอร์ได้',
          status: 'error',
          code: 503,
          id: 5030,
        }
      }
    }
    return {
      title: error.name,
      description: error.response?.data?.message ?? error.message,
      status: 'error',
      isClosable: true,
      code: error.response?.status ?? null,
    }
  }
  error = new Error(error)
  return {
    title: error.name,
    description: error.message,
    status: 'error',
    isClosable: true,
    code: null,
  }
}
