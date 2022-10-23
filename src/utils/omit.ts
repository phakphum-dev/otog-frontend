export function omit<T>(key: string, obj: Record<string, T>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [key]: omitted, ...rest } = obj
  return rest
}
