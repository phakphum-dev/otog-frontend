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
      <Link
        isExternal
        href={`${API_HOST}problem/doc/${submission.problem.id}`}
        noOfLines={1}
      >
        {submission.problem.name}
      </Link>
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
