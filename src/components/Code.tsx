import clsx from 'clsx'
import Highlight, { Language, defaultProps } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/vsDark'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { FaGlobe, FaRegShareSquare } from 'react-icons/fa'

import { API_HOST, APP_HOST } from '@src/config'
import { useClipboard } from '@src/hooks/useClipboard'
import { CopyIcon } from '@src/icons/CopyIcon'
import { useSubmissionWithSourceCode } from '@src/submission/queries'
import {
  SubmissionWithProblem,
  SubmissionWithSourceCode,
} from '@src/submission/types'
import { IconButton } from '@src/ui/IconButton'
import { Button } from '@src/ui/Button'
import { Link } from '@src/ui/Link'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from '@src/ui/Modal'
import { ONE_SECOND, toThDate } from '@src/utils/time'
import { UseDisclosuredReturn } from '@src/hooks/useDisclosure'
import { useMutation } from '@src/hooks/useMutation'
import { shareCode } from '@src/submission/queries'
import { onErrorToast } from '@src/hooks/useErrorToast'
import produce from 'immer'
import { useUserData } from '@src/context/UserContext'
import { useDisclosure } from '@src/hooks/useDisclosure'

export interface CodeModalProps extends UseDisclosuredReturn {
  submissionId: number
  canShare?: boolean
}

const language: Record<string, string> = {
  cpp: 'C++',
  c: 'C',
  python: 'Python',
}

export const CodeModal = (props: CodeModalProps) => {
  const { onClose, isOpen, opened, submissionId, canShare } = props
  const { data: submission } = useSubmissionWithSourceCode(
    opened ? submissionId : 0
  )

  return (
    <Modal onClose={onClose} isOpen={isOpen} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {submission ? (
            <Link
              isExternal
              variant="hidden"
              href={`${API_HOST}problem/doc/${submission?.problem.id}`}
            >
              ข้อ {submission?.problem.name}
            </Link>
          ) : (
            <div className="my-2 h-5 w-40 animate-pulse rounded-sm bg-slate-200 dark:bg-slate-700" />
          )}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SubmissionContent submission={submission} canShare={canShare} />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}

export interface SubmissionContentProps {
  submission?: SubmissionWithSourceCode
  canShare?: boolean
}

export const SubmissionContent = (props: SubmissionContentProps) => {
  const { submission, canShare = true } = props

  const { onCopy, hasCopied } = useClipboard(submission?.sourceCode ?? '')
  useEffect(() => {
    if (hasCopied) {
      toast.success('คัดลอกไปยังคลิปบอร์ดแล้ว')
    }
  }, [hasCopied])

  const { onCopy: onLinkCopy } = useClipboard(
    submission ? `${APP_HOST}submission/${submission.id}` : ''
  )
  const { mutate } = useSubmissionWithSourceCode(submission ? submission.id : 0)
  const shareCodeMutation = useMutation(shareCode)
  const onShare = async () => {
    if (!submission) return
    try {
      const { public: isPublic } = await shareCodeMutation(
        submission.id,
        !submission.public
      )
      if (isPublic) {
        onLinkCopy()
        toast.success(
          <div>
            <b>เปิดการแชร์สำเร็จ</b>
            <p>คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว</p>
          </div>
        )
      } else {
        toast.success('ปิดการแชร์แล้ว')
      }
      mutate(
        produce((submission) => {
          submission.public = isPublic
        })
      )
    } catch (e) {
      onErrorToast(e)
    }
  }
  const errorDisclosure = useDisclosure()

  const { user, isAdmin } = useUserData()

  return (
    <div className="flex flex-col gap-2">
      <div>
        {submission ? (
          <>
            <div>
              ผลตรวจ:{' '}
              {submission.errmsg &&
              (isAdmin || user?.id === submission.user.id) ? (
                <>
                  <Button variant="link" onClick={errorDisclosure.onOpen}>
                    {submission.result}
                  </Button>
                  <ErrorModal {...errorDisclosure} submission={submission} />
                </>
              ) : (
                <code>{submission.result}</code>
              )}
            </div>
            <div>คะแนน: {submission.score}</div>
            <div>ภาษา: {language[submission.language]}</div>
            <div>เวลารวม: {submission.timeUsed / ONE_SECOND} วินาที</div>

            <div>เวลาที่ส่ง: {toThDate(submission.creationDate)}</div>
            <div className="line-clamp-3">
              ผู้ส่ง: {submission.user.showName}
            </div>
            <div>ผลตรวจที่: {submission.id}</div>
          </>
        ) : (
          <>
            <div className="my-2 h-4 w-40 animate-pulse rounded-sm bg-slate-200 dark:bg-slate-700" />
            <div className="my-2 h-4 w-80 animate-pulse rounded-sm bg-slate-200 dark:bg-slate-700" />
            <div className="my-2 h-4 w-20 animate-pulse rounded-sm bg-slate-200 dark:bg-slate-700" />
            <div className="my-2 h-4 w-36 animate-pulse rounded-sm bg-slate-200 dark:bg-slate-700" />
            <div className="my-2 h-4 w-48 animate-pulse rounded-sm bg-slate-200 dark:bg-slate-700" />
            <div className="my-2 h-4 w-24 animate-pulse rounded-sm bg-slate-200 dark:bg-slate-700" />
          </>
        )}
      </div>
      <div className="relative">
        {submission ? (
          <>
            <CodeHighlight
              code={submission.sourceCode}
              language={submission.language}
            />
            <div className="absolute right-2 top-2 flex gap-2">
              {canShare && submission.user.id === user?.id && (
                <IconButton
                  aria-label="share"
                  icon={submission?.public ? <FaGlobe /> : <FaRegShareSquare />}
                  size="sm"
                  onClick={onShare}
                />
              )}
              <IconButton
                aria-label="copy"
                icon={<CopyIcon />}
                size="sm"
                onClick={onCopy}
              />
            </div>
          </>
        ) : (
          <div className="my-2 h-80 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
        )}
      </div>
    </div>
  )
}

export interface ErrorModalProp extends Omit<ModalProps, 'children'> {
  submission: SubmissionWithProblem
}

export const ErrorModal = (props: ErrorModalProp) => {
  const { onClose, isOpen, submission } = props
  return (
    <Modal onClose={onClose} isOpen={isOpen} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>ข้อ {submission?.problem.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <CodeHighlight
            code={submission?.errmsg ?? ''}
            language={submission?.language ?? 'cpp'}
          />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
export interface CodeHighlightProps {
  code: string
  language: Language
}

export const CodeHighlight = (props: CodeHighlightProps) => {
  return (
    <Highlight
      {...defaultProps}
      code={props.code ?? ''}
      language={props.language}
      theme={theme}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          style={{ ...style, tabSize: 4 }}
          className={clsx(className, 'overflow-x-auto rounded-md p-4 text-xs')}
        >
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })} key={i}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} key={key} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}
