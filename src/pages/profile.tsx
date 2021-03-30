import { IconButton } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { Image } from '@chakra-ui/image'
import { Box, HStack } from '@chakra-ui/layout'
import { ImageUpdateModal } from '@src/components/ImageUploadModal'
import { PageContainer } from '@src/components/PageContainer'
import { Title } from '@src/components/Title'
import { useAuth } from '@src/utils/api/AuthProvider'
import { FaEdit, FaUser, FaUserCircle } from 'react-icons/fa'

import { getServerSideProps as getServerSideCookies } from '@src/utils/api'
import { GetServerSideProps } from 'next'
import { ChangeEvent } from 'react'
import { storage } from '@src/utils/firebase'
import { UploadFileButton } from '@src/components/FileInput'
import Icon from '@chakra-ui/icon'

export default function ProfilePage() {
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
    <PageContainer>
      <Title icon={FaUser}>โปรไฟล์</Title>
      <Box position="relative" boxSize="xs">
        {profileSrc ? (
          <Image
            width="100%"
            src={profileSrc}
            objectFit="cover"
            borderRadius="md"
            bg="gray.300"
            boxSize="xs"
          />
        ) : (
          <Icon as={FaUserCircle} boxSize="xs" color="gray.300" />
        )}
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
    </PageContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const serverSideCookies = await getServerSideCookies(context)
  if (!serverSideCookies.props.accessToken) {
    return {
      redirect: {
        permanent: false,
        destination: '/login',
      },
    }
  }
  return serverSideCookies
}
