import { Button } from '@chakra-ui/button'
import { PageContainer } from '@src/components/PageContainer'

import { UploadFile } from '@src/components/UploadFile'
import { useAuth } from '@src/utils/api/AuthProvider'
import { storage } from '@src/utils/firebase'
import { ChangeEvent, useState } from 'react'

export default function ProfilePage() {
  const { refreshProfilePic } = useAuth()
  const [file, setFile] = useState<File>()
  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length === 0) return
    setFile(e.target.files?.[0])
  }

  const { user } = useAuth()
  const onUpload = () => {
    if (user && file) {
      const uploadTask = storage.ref(`images/${user.id}`).put(file)
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // const progress = Math.round(
          //   (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          // )
          // setProgress(progress)
        },
        (error) => {
          console.log(error)
        },
        () => {
          refreshProfilePic()
        }
      )
    }
  }
  return (
    <PageContainer>
      <UploadFile fileName={file?.name} onChange={onFileSelect} />
      <Button onClick={onUpload}>อัปโหลด</Button>
    </PageContainer>
  )
}

export { getServerSideProps } from '@src/utils/api'
