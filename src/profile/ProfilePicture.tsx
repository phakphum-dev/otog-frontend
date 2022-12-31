import Avatar from 'boring-avatars'
import { ChangeEvent } from 'react'
import { FaCropAlt } from 'react-icons/fa'
import { mutate } from 'swr'

import { Img } from '@chakra-ui/image'

import { UploadFileButton } from '@src/components/FileInput'
import { useAuth } from '@src/context/AuthContext'
import { storage } from '@src/firebase'
import { useDisclosure } from '@src/hooks/useDisclosure'
import { useErrorToast } from '@src/hooks/useErrorToast'
import {
  ImageCropModal,
  createImageFromFile,
  getCroppedImage,
} from '@src/profile/ImageCropModal'
import { useProfilePic, useUserProfilePic } from '@src/profile/useProfilePic'
import { IconButton } from '@src/ui/IconButton'

export const ProfileUpload = () => {
  const cropModal = useDisclosure()
  const { user } = useAuth()
  const { url, fetchUrl } = useUserProfilePic()

  const { onError } = useErrorToast()
  const onFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length === 0) return
    const file = e.target.files?.[0]
    if (file) {
      try {
        const image = await createImageFromFile(file)
        const croppedImage = await getCroppedImage(image)
        if (croppedImage) {
          onUpload(croppedImage)
        }
      } catch (e: any) {
        onError(e)
      }
    }
  }

  const onUpload = (file: File) => {
    if (user) {
      const uploadTask = storage
        .ref(`images/${user.id}.jpeg`)
        .put(file, { contentType: 'image/jpeg' })
      uploadTask.on(
        'state_changed',
        () => {
          // const progress = Math.round(
          //   (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          // )
          // setProgress(progress)
        },
        (error) => onError(error),
        () => {
          fetchUrl()
          setTimeout(() => {
            mutate([user.id, true])
          }, 1000)
        }
      )
    }
  }

  return (
    <div>
      <div className="relative flex-1 w-80">
        <Picture url={url} name={user!.showName} />
        <div className="flex gap-2 absolute top-2 right-2">
          <UploadFileButton accept=".png,.jpg,.jpeg" onChange={onFileSelect} />
          {url && (
            <>
              <IconButton
                size="xs"
                aria-label="edit-profile-image"
                icon={<FaCropAlt />}
                onClick={cropModal.onOpen}
              />
              <ImageCropModal {...cropModal} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export interface ProfilePictureProps {
  userId: number
  name: string
}

export const ProfilePicture = ({ userId, name }: ProfilePictureProps) => {
  const { url } = useProfilePic(userId)
  return <Picture url={url} name={name} />
}

export interface PictureProps {
  url: string | undefined
  name: string
}

export const Picture = ({ url, name }: PictureProps) => {
  return url ? (
    <Img
      width="100%"
      src={url}
      objectFit="cover"
      borderRadius="md"
      bg="gray.300"
      boxSize="xs"
    />
  ) : (
    <Avatar
      size={320}
      name={name}
      variant="beam"
      colors={['#ff851b', '#17b4e9', '#41e241', '#ff4d4d']}
    />
  )
}
