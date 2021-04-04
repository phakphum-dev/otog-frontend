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
