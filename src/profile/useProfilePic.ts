import useSWRImmutable from 'swr/immutable'

import { useAuth } from '@src/context/AuthContext'
import { storage } from '@src/firebase'

export type ProfileKey = { userId: number; small: boolean }

async function getProfileUrl({ userId, small }: ProfileKey): Promise<string> {
  const url = await storage
    .ref('images')
    .child(`${userId}${small ? '_32' : ''}.jpeg`)
    .getDownloadURL()
  return url
}

export const useProfilePic = (userId: number | undefined, small = false) => {
  const { data: url, mutate: fetchUrl } = useSWRImmutable(
    userId ? { userId, small } : null,
    getProfileUrl,
    {
      onError: (error) => {
        if (error.code === 'storage/object-not-found') return
      },
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )

  return { url, fetchUrl }
}

export const useUserProfilePic = (small = false) => {
  const { user } = useAuth()
  return useProfilePic(user?.id, small)
}
