import { useEffect, useState } from 'react'
import useSWR from 'swr'

export function toThDate(date: string) {
  return new Date(date).toLocaleDateString('th-TH', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
}

export function getHMS(ms: number) {
  const s = ~~(ms / 1000)
  const m = ~~(s / 60)
  const h = ~~(m / 60)
  return [h, m % 60, s % 60]
}

export function toTimerFormat(ms: number) {
  const [h, m, s] = getHMS(ms)
  return `${h} : ${m < 10 ? '0' + m : m} : ${s < 10 ? '0' + s : s}`
}

export function toThTimeFormat(ms: number) {
  const [h, m, s] = getHMS(ms)
  return [h && `${h} ชั่วโมง`, m && `${m} นาที`, s && `${s} วินาที`]
    .filter((str) => str)
    .join(' ')
}

export function useTimer(start: string, end: string) {
  const getRemaining = (start: string, end: string) =>
    new Date(end).getTime() - new Date(start).getTime()

  const [remaining, setRemaining] = useState(() => getRemaining(start, end))

  useEffect(() => {
    if (start && end) {
      setRemaining(getRemaining(start, end))
    }
  }, [start, end])

  useEffect(() => {
    if (remaining > 0) {
      const interval = setInterval(() => {
        setRemaining((current) => current - 1000)
      }, 1000)
      return () => {
        clearInterval(interval)
      }
    }
  }, [remaining > 0])
  return remaining
}

export function useServerTime(intialTime?: string) {
  return useSWR<string>('time', {
    initialData: intialTime,
    revalidateOnMount: true,
  })
}
