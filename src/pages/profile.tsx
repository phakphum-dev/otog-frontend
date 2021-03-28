import { IconButton } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { EditIcon } from '@chakra-ui/icons'
import { Image } from '@chakra-ui/image'
import { Box } from '@chakra-ui/layout'
import { ImageUploadModal } from '@src/components/ImageUploadModal'
import { PageContainer } from '@src/components/PageContainer'
import { Title } from '@src/components/Title'
import { useAuth } from '@src/utils/api/AuthProvider'
import { FaUser } from 'react-icons/fa'

export default function ProfilePage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { profileSrc } = useAuth()
  return (
    <PageContainer>
      <Title icon={FaUser}>โปรไฟล์</Title>
      <Box position="relative" boxSize="xs">
        <Image
          width="100%"
          src={profileSrc}
          alt="Profile Picture"
          objectFit="cover"
          borderRadius="md"
        />
        <IconButton
          size="xs"
          aria-label="edit-profile"
          position="absolute"
          top={2}
          right={2}
          icon={<EditIcon />}
          onClick={onOpen}
        />
      </Box>
      <ImageUploadModal isOpen={isOpen} onClose={onClose} />
    </PageContainer>
  )
}

export { getServerSideProps } from '@src/utils/api'
