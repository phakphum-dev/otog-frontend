import { storage } from '@src/firebase'
import { useEffect, useState } from 'react'

const urlMap = new Map<string, string>()

export const useProfilePic = (
  userId: number | undefined,
  { full = false, auto = true } = {}
) => {
  const [url, setUrl] = useState<string>()
  const name = `${userId}${full ? '' : '_32'}`
  const fetchUrl = async () => {
    if (!userId) return
    try {
      const url = await storage
        .ref('images')
        .child(`${name}.jpeg`)
        .getDownloadURL()
      urlMap.set(name, url)
      setUrl(url)
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        setUrl(undefined)
      } else {
        console.log(error)
      }
    }
  }

  useEffect(() => {
    if (auto && userId) {
      if (urlMap.has(name)) {
        setUrl(urlMap.get(name))
      } else {
        fetchUrl()
      }
    }
  }, [userId, auto])
  return { url, fetchUrl }
}
