export function omit<T>(key: string, obj: Record<string, T>) {
  const { [key]: omitted, ...rest } = obj
  return rest
}
