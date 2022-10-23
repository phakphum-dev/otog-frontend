import { ChangeEvent } from 'react'
import { FaCropAlt, FaUserCircle } from 'react-icons/fa'
import { mutate } from 'swr'

import { IconButton } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import Icon from '@chakra-ui/icon'
import { Img } from '@chakra-ui/image'
import { Box, HStack } from '@chakra-ui/layout'

import { UploadFileButton } from '@src/components/FileInput'
import { useAuth } from '@src/context/AuthContext'
import { storage } from '@src/firebase'
import { useErrorToast } from '@src/hooks/useErrorToast'
import {
  ImageCropModal,
  createImageFromFile,
  getCroppedImage,
} from '@src/profile/ImageCropModal'
import { useProfilePic, useUserProfilePic } from '@src/profile/useProfilePic'

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
      <Box position="relative" boxSize="xs" flex={1}>
        <Picture url={url} />
        <HStack position="absolute" top={2} right={2}>
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
        </HStack>
      </Box>
    </div>
  )
}

export interface ProfilePictureProps {
  userId: number
}

export const ProfilePicture = (props: ProfilePictureProps) => {
  const { userId } = props
  const { url } = useProfilePic(userId, { auto: true })
  return <Picture url={url} />
}

export interface PictureProps {
  url: string | undefined
}

export const Picture = (props: PictureProps) => {
  const { url } = props
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
    <Icon as={FaUserCircle} boxSize="xs" color="gray.300" />
  )
}
