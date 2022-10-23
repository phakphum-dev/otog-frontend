import { OrangeSubmitButton } from './SubmitButton'
import { SubmitModal } from './SubmitModal'

import { useDisclosure } from '@chakra-ui/hooks'
import { HStack, Link, Text } from '@chakra-ui/layout'

import { API_HOST } from '@src/config'
import { useAuth } from '@src/context/AuthContext'
import { useLatestSubmission } from '@src/submission/queries'

export interface LatestSubmissionProps {
  onSuccess?: () => void
}

export const LatestSubmission = ({ onSuccess }: LatestSubmissionProps) => {
  const submitModal = useDisclosure()
  const { isAuthenticated } = useAuth()
  const { data: submission } = useLatestSubmission()

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
        onSuccess={onSuccess}
        submitted={true}
        {...submitModal}
      />
    </HStack>
  ) : (
    <div />
  )
}
