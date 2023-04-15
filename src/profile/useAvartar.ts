import useSWRImmutable from 'swr/immutable'

import { useUserData } from '@src/context/UserContext'
import { storage } from '@src/firebase'

export type AvatarKey = { userId: number; small: boolean }

export async function getAvatarUrl({ userId, small }: AvatarKey) {
  try {
    const url = await storage
      .ref('images')
      .child(`${userId}${small ? '_32' : ''}.jpeg`)
      .getDownloadURL()
    return url as string
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      return null
    }
    throw error
  }
}

export const useBigAvatar = (userId: number | undefined) => {
  const { data: url, mutate: fetchUrl } = useSWRImmutable(
    userId ? { userId, small: false } : null,
    getAvatarUrl,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )
  return { url, fetchUrl }
}

export const useSmallAvatar = (userId: number | undefined) => {
  const { data: url, mutate: fetchUrl } = useSWRImmutable(
    userId ? { userId, small: true } : null,
    getAvatarUrl,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )

  return { url, fetchUrl }
}

export const useUserBigAvatar = () => {
  const { user } = useUserData()
  return useBigAvatar(user?.id)
}

export const useUserSmallAvatar = () => {
  const { user } = useUserData()
  return useSmallAvatar(user?.id)
}
