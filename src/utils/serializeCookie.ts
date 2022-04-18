export function serializeCookies(cookies: Record<string, string>) {
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')
}
