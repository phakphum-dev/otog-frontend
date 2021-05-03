import { useDisclosure } from '@chakra-ui/hooks'
import { HStack, Text, Link } from '@chakra-ui/layout'
import { API_HOST } from '@src/utils/api'
import { useAuth } from '@src/utils/api/AuthProvider'
import { useLatestSubmission, useSubmissions } from '@src/utils/api/Submission'
import { OrangeSubmitButton } from './SubmitButton'
import { SubmitModal } from './SubmitModal'

export const LatestSubmission = () => {
  const submitModal = useDisclosure()
  const { isAuthenticated } = useAuth()
  const { data: submission } = useLatestSubmission()
  const { mutate } = useSubmissions()

  return isAuthenticated && submission ? (
    <HStack spacing={4}>
      <Text fontWeight="bold">ส่งข้อล่าสุด</Text>
      <Text isTruncated color="otog">
        <Link
          href={`${API_HOST}problem/doc/${submission.problem.id}`}
          target="_blank"
        >
          {submission.problem.name}
        </Link>
      </Text>
      <OrangeSubmitButton onClick={submitModal.onOpen} />
      <SubmitModal
        problem={submission.problem}
        onSuccess={mutate}
        submitted={true}
        {...submitModal}
      />
    </HStack>
  ) : (
    <div />
  )
}
