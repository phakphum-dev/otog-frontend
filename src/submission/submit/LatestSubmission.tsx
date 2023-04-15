import { OrangeSubmitButton } from './SubmitButton'
import { SubmitModal } from './SubmitModal'

import { API_HOST } from '@src/config'
import { useUserData } from '@src/context/UserContext'
import { useDisclosure } from '@src/hooks/useDisclosure'
import { useLatestSubmission } from '@src/submission/queries'
import { Link } from '@src/ui/Link'

export interface LatestSubmissionProps {
  onSuccess?: () => void
}

export const LatestSubmission = ({ onSuccess }: LatestSubmissionProps) => {
  const submitModal = useDisclosure()
  const { isAuthenticated } = useUserData()
  const { data: submission } = useLatestSubmission()

  return isAuthenticated && submission ? (
    <div className="flex items-center gap-4">
      <div className="font-bold">ส่งข้อล่าสุด</div>
      <Link
        className="line-clamp-1"
        isExternal
        href={`${API_HOST}problem/doc/${submission.problem.id}`}
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
    </div>
  ) : (
    <div />
  )
}
