import axios from 'axios'
import { createStandaloneToast } from '@chakra-ui/react'

const API_HOST = process.env.NEXT_PUBLIC_API_HOST

const http = axios.create({
  baseURL: API_HOST,
  //   withCredentials: true,
})

const errorToast = createStandaloneToast()

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const err = new Error(error)
    errorToast({
      title: err.name,
      description: err.message,
      status: 'error',
      isClosable: true,
    })
    return Promise.reject(err)
  }
)

async function get<T>(url: string, params?: any): Promise<T> {
  return (await http.get(url, { params })).data
}

async function post<D, T>(url: string, data?: D): Promise<T> {
  return (await http.post(url, data)).data
}

async function put<D, T>(url: string, data?: D): Promise<T> {
  return (await http.put(url, data)).data
}

async function del(url: string): Promise<void> {
  await http.delete(url)
}

export { API_HOST, http, get, post, put, del }
