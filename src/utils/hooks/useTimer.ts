import { useEffect, useState } from 'react'

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
  return `${h}:${m}:${s}`
}

export function toLengthFormat(ms: number) {
  const [h, m, s] = getHMS(ms)
  return [h && `${h} ชั่วโมง`, m && `${m} นาที`, s && `${s} นาที`]
    .filter((str) => str)
    .join(' ')
}

export function useTimer(start: Date, end: Date) {
  const [current, setCurrent] = useState(end.getTime() - start.getTime())
  useEffect(() => {
    setInterval(() => {
      setCurrent((current) => current - 1000)
    }, 1000)
  }, [])
  return [toTimerFormat(current), current]
}
