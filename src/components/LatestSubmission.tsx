import { useDisclosure } from '@chakra-ui/hooks'
import { HStack, Text, Link } from '@chakra-ui/layout'
import { useAuth } from '@src/utils/api/AuthProvider'
import { useLatestSubmission } from '@src/utils/api/Submission'
import { SubmitButton } from './SubmitButton'
import { SubmitModal } from './SubmitModal'

export function LatestSubmission() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isAuthenticated } = useAuth()
  const { data: submission } = useLatestSubmission()

  return isAuthenticated && submission ? (
    <HStack spacing={{ base: 2, md: 4 }}>
      <Text>ส่งข้อล่าสุด:</Text>
      <Text isTruncated>
        <Link color="otog" href="#">
          {submission.problem.name}
        </Link>
      </Text>
      <SubmitButton onClick={onOpen} />
      <SubmitModal
        problem={submission.problem}
        onClose={onClose}
        isOpen={isOpen}
      />
    </HStack>
  ) : (
    <div />
  )
}
