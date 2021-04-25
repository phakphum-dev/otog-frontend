import { useToast, UseToastOptions } from '@chakra-ui/toast'
import { AxiosError } from 'axios'

export type ErrorToastOptions = UseToastOptions & {
  code: number | null
}

export function useErrorToast() {
  const toast = useToast()
  const onError = (e: any) => {
    toast(getErrorToast(e))
  }
  return { onError, toast }
}

export function getErrorToast(e: any): ErrorToastOptions {
  if (e.isAxiosError) {
    const error = e as AxiosError
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
          }
        }
        return {
          title: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
          status: 'warning',
          duration: 2000,
          code: 401,
        }
      case 403:
        if (url === 'auth/refresh/token') {
          return {
            title: 'เซสชันหมดอายุ',
            description: 'กรุณาลงชื่อเข้าใช้อีกครั้ง',
            status: 'info',
            isClosable: true,
            code: 403,
          }
        }
        return {
          title: 'คุณไม่มีสิทธิ์ในการใช้งานส่วนนี้',
          status: 'error',
          duration: 2000,
          code: 403,
        }
      case 409:
        const message = error.response.data.message
        if (message === 'username was taken.') {
          return {
            title: 'ลงทะเบียนไม่สำเร็จ !',
            description: 'ชื่อผู้ใช้นี้ ได้ถูกใช้ไปแล้ว',
            status: 'error',
            isClosable: true,
            code: 409,
          }
        }
        if (message === 'showName was taken.') {
          return {
            title: 'ลงทะเบียนไม่สำเร็จ !',
            description: 'ชื่อที่ใช้แสดงนี้ ได้ถูกใช้ไปแล้ว',
            status: 'error',
            isClosable: true,
            code: 409,
          }
        }
        break
      case undefined: {
        return {
          title: 'เซิฟเวอร์ยังไม่เปิด',
          status: 'error',
          code: 503,
        }
      }
    }
    return {
      title: error.name,
      description: error.message,
      status: 'error',
      isClosable: true,
      code: error.response?.status ?? null,
    }
  }
  const error = new Error(e)
  return {
    title: error.name,
    description: error.message,
    status: 'error',
    isClosable: true,
    code: null,
  }
}
