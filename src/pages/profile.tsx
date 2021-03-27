import { Button } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { ImageUploadModal } from '@src/components/ImageUploadModal'
import { PageContainer } from '@src/components/PageContainer'

export default function ProfilePage() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <PageContainer>
      <Button onClick={onOpen}>แก้ไข</Button>
      <ImageUploadModal isOpen={isOpen} onClose={onClose} />
    </PageContainer>
  )
}

export { getServerSideProps } from '@src/utils/api'
