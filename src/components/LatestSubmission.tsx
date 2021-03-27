import { useDisclosure } from '@chakra-ui/hooks'
import { HStack, Text, Link } from '@chakra-ui/layout'
import { API_HOST } from '@src/utils/api'
import { useAuth } from '@src/utils/api/AuthProvider'
import { useLatestSubmission, useSubmissions } from '@src/utils/api/Submission'
import { SubmitButton } from './SubmitButton'
import { SubmitModal } from './SubmitModal'

interface LatestSubmissionProps {
  isOnlyMe: boolean
}

export function LatestSubmission(props: LatestSubmissionProps) {
  const { isOnlyMe } = props
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isAuthenticated } = useAuth()
  const { data: submission } = useLatestSubmission()
  const { mutate } = useSubmissions(isOnlyMe)

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
        onSuccess={mutate}
      />
    </HStack>
  ) : (
    <div />
  )
}