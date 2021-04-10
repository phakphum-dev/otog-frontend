import {
  createStandaloneToast,
  useToast,
  UseToastOptions,
} from '@chakra-ui/toast'
import { AxiosError } from 'axios'

export const errorToast = createStandaloneToast()

export function onError(e: any) {
  const error = new Error(e)
  errorToast({
    title: error.name,
    description: error.message,
    status: 'error',
    isClosable: true,
  })
}

export function getErrorToast(e: any): UseToastOptions {
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
          }
        }
        return {
          title: 'เซสชันหมดอายุ',
          description: 'กรุณาลงชื่อเข้าใช้อีกครั้ง',
          status: 'info',
          isClosable: true,
        }
      case 403:
        return {
          title: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
          status: 'warning',
          isClosable: true,
        }
      case 409:
        const message = error.response.data.message
        if (message === 'username was taken.') {
          return {
            title: 'ลงทะเบียนไม่สำเร็จ !',
            description: 'ชื่อผู้ใช้นี้ ได้ถูกใช้ไปแล้ว',
            status: 'error',
            isClosable: true,
          }
        }
        if (message === 'showName was taken.') {
          return {
            title: 'ลงทะเบียนไม่สำเร็จ !',
            description: 'ชื่อที่ใช้แสดงนี้ ได้ถูกใช้ไปแล้ว',
            status: 'error',
            isClosable: true,
          }
        }
        break
      case undefined: {
        return {
          title: 'เซิฟเวอร์ยังไม่เปิด',
          duration: null,
          status: 'error',
        }
      }
    }
  }
  const error = new Error(e)
  return {
    title: error.name,
    description: error.message,
    status: 'error',
    isClosable: true,
  }
}

export function useToastError() {
  const toast = useToast()
  const onError = (e: any) => {
    toast(getErrorToast(e))
  }
  return { onError, toast }
}
