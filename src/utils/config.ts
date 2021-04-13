export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
export const API_HOST = process.env.NEXT_PUBLIC_API_HOST
export const CONTACT_LINK = process.env.NEXT_PUBLIC_CONTACT_LINK

export const getFirebaseConfig = (base64: string | undefined): object => {
  if (base64) {
    const json = Buffer.from(base64, 'base64').toString('ascii')
    return JSON.parse(json)
  }
  return {}
}

export const FIREBASE_CONFIG = getFirebaseConfig(
  process.env.NEXT_PUBLIC_FIREBASE_CONFIG
)
