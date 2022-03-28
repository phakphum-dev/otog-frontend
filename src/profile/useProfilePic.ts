import useSWR from 'swr'

import { useAuth } from '@src/context/AuthContext'
import { storage } from '@src/firebase'

export const useProfilePic = (
  userId: number | undefined,
  { small = false, auto = true } = {}
) => {
  const fetcher = async (userId: number, small: boolean): Promise<string> =>
    storage
      .ref('images')
      .child(`${userId}${small ? '_32' : ''}.jpeg`)
      .getDownloadURL()

  const { data: url, mutate: fetchUrl } = useSWR<string>(
    userId ? [userId, small] : null,
    fetcher,
    {
      revalidateOnMount: auto,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )

  return { url, fetchUrl }
}

export const useUserProfilePic = ({ small = false, auto = true } = {}) => {
  const { user } = useAuth()
  return useProfilePic(user?.id, { small, auto })
}
