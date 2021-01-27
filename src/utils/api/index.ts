import axios from 'axios'

const API_HOST = process.env.NEXT_PUBLIC_API_HOST

const http = axios.create({
  baseURL: API_HOST,
  //   withCredentials: true,
})

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
