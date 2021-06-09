import { storage } from '@src/firebase'
import { useState } from 'react'

export const useProfilPic = (userId?: number) => {
  const [url, setUrl] = useState<string>()
  const fetchUrl = async () => {
    try {
      if (userId) {
        const url = await storage
          .ref('images')
          .child(`${userId}.png`)
          .getDownloadURL()
        setUrl(url)
      }
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        setUrl(undefined)
      } else {
        console.log(error)
      }
    }
  }
  return { url, fetchUrl }
}
