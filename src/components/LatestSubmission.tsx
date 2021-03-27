import { useDisclosure } from '@chakra-ui/hooks'
import { HStack, Text, Link } from '@chakra-ui/layout'
import { API_HOST } from '@src/utils/api'
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
      <Text fontWeight="bold">ส่งข้อล่าสุด:</Text>
      <Text isTruncated color="otog">
        <Link
          href={`${API_HOST}problem/doc/${submission.problem.id}`}
          target="_blank"
        >
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
