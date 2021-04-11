import { IconButton } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { Image } from '@chakra-ui/image'
import { Box, HStack } from '@chakra-ui/layout'
import { ImageUpdateModal } from '@src/components/ImageUploadModal'

import { useAuth } from '@src/utils/api/AuthProvider'
import { FaEdit, FaUserCircle } from 'react-icons/fa'

import { ChangeEvent, useEffect, useState } from 'react'
import { storage } from '@src/utils/firebase'
import { UploadFileButton } from '@src/components/FileInput'
import Icon from '@chakra-ui/icon'

export function ProfileUpload() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user, profileSrc, refreshProfilePic } = useAuth()

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length === 0) return
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  const onUpload = (file: File) => {
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
    <div>
      <Box position="relative" boxSize="xs" flex={1}>
        <Picture url={profileSrc} />
        <HStack position="absolute" top={2} right={2}>
          <UploadFileButton accept=".png,.jpg,.jpeg" onChange={onFileSelect} />
          {profileSrc && (
            <IconButton
              size="xs"
              aria-label="edit-profile-image"
              icon={<FaEdit />}
              onClick={onOpen}
            />
          )}
        </HStack>
      </Box>
      <ImageUpdateModal isOpen={isOpen} onClose={onClose} />
    </div>
  )
}

export interface ProfilePictureProps {
  userId: number
}

export function ProfilePicture(props: ProfilePictureProps) {
  const { userId } = props
  const [url, setUrl] = useState<string>()
  const getProfileUrl = async (userId: number) => {
    try {
      const url = await storage
        .ref('images')
        .child(`${userId}`)
        .getDownloadURL()
      setUrl(url)
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        setUrl(undefined)
      }
    }
  }
  useEffect(() => {
    getProfileUrl(userId)
  }, [])
  return <Picture url={url} />
}

export interface PictureProps {
  url: string | undefined
}

export function Picture(props: PictureProps) {
  const { url } = props
  return url ? (
    <Image
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
