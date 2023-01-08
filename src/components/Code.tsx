import clsx from 'clsx'
import Highlight, { Language, defaultProps } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/vsDark'
import { PropsWithChildren, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { FaRegShareSquare } from 'react-icons/fa'

import { CopyIcon } from '@chakra-ui/icons'
import {
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Skeleton,
} from '@chakra-ui/react'

import { API_HOST, APP_HOST } from '@src/config'
import { useClipboard } from '@src/hooks/useClipboard'
import { useSubmission } from '@src/submission/queries'
import {
  SubmissionWithProblem,
  SubmissionWithSourceCode,
} from '@src/submission/types'
import { IconButton } from '@src/ui/IconButton'
import { ONE_SECOND, toThDate } from '@src/utils/time'

export interface CodeModalProps extends Omit<ModalProps, 'children'> {
  submissionId: number
}

const language: Record<string, string> = {
  cpp: 'C++',
  c: 'C',
  python: 'Python',
}

export const CodeModal = (props: CodeModalProps) => {
  const { onClose, isOpen, submissionId } = props
  const { data: submission } = useSubmission(submissionId)

  return (
    <Modal onClose={onClose} isOpen={isOpen} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <TextSkeleton w={80} h={6}>
            <Link
              isExternal
              variant="hidden"
              href={`${API_HOST}problem/doc/${submission?.problem.id}`}
            >
              ข้อ {submission?.problem.name}
            </Link>
          </TextSkeleton>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SubmissionContent submission={submission} />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}

export interface SubmissionContentProps {
  submission?: SubmissionWithSourceCode
}

export const SubmissionContent = (props: SubmissionContentProps) => {
  const { submission } = props
  const isLoaded = !!submission

  const { onCopy, hasCopied } = useClipboard(submission?.sourceCode ?? '')
  useEffect(() => {
    if (hasCopied) {
      toast.success('คัดลอกไปยังคลิปบอร์ดแล้ว')
    }
  }, [hasCopied])

  const { onCopy: onLinkCopy, hasCopied: hasLinkCopied } = useClipboard(
    submission ? `${APP_HOST}submission/${submission.id}` : ''
  )
  useEffect(() => {
    if (hasLinkCopied) {
      toast.success(
        <div>
          <b>เปิดการแชร์ (เฉพาะแอดมิน)</b>
          <p>คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว</p>
        </div>
      )
    }
  }, [hasLinkCopied])

  return (
    <div className="flex flex-col gap-2">
      <div>
        <TextSkeleton w={40}>
          {submission && (
            <div>
              ผลตรวจ: <code>{submission.result}</code>
            </div>
          )}
        </TextSkeleton>
        <TextSkeleton w={18}>
          {submission && <div>คะแนน: {submission.score}</div>}
        </TextSkeleton>
        <TextSkeleton w={20}>
          {submission && <div>ภาษา: {language[submission.language]}</div>}
        </TextSkeleton>
        <TextSkeleton w={36}>
          {submission && (
            <div>เวลารวม: {submission.timeUsed / ONE_SECOND} วินาที</div>
          )}
        </TextSkeleton>

        <TextSkeleton w={48}>
          {submission && (
            <div>เวลาที่ส่ง: {toThDate(submission.creationDate)}</div>
          )}
        </TextSkeleton>
        <TextSkeleton w={24}>
          {submission && (
            <div className="line-clamp-3">
              ผู้ส่ง: {submission.user.showName}
            </div>
          )}
        </TextSkeleton>
        <TextSkeleton w={36}>
          {submission && <div>ผลตรวจที่: {submission.id}</div>}
        </TextSkeleton>
      </div>
      <div className="relative">
        <Skeleton isLoaded={isLoaded} h={isLoaded ? 'auto' : 80} rounded="lg">
          {submission && (
            <>
              <CodeHighlight
                code={submission.sourceCode}
                language={submission.language}
              />
              <div className="flex gap-2 absolute top-2 right-2">
                <IconButton
                  aria-label="share"
                  icon={<FaRegShareSquare />}
                  size="sm"
                  onClick={onLinkCopy}
                />
                <IconButton
                  aria-label="copy"
                  icon={<CopyIcon />}
                  size="sm"
                  onClick={onCopy}
                />
              </div>
            </>
          )}
        </Skeleton>
      </div>
    </div>
  )
}

const TextSkeleton = ({
  h = 4,
  w,
  children,
}: PropsWithChildren<{ h?: number; w: number }>) => {
  const isLoaded = !!children
  return (
    <Skeleton
      isLoaded={isLoaded}
      w={isLoaded ? 'auto' : w}
      h={isLoaded ? 'auto' : h}
      mt={isLoaded ? 0 : 2}
    >
      {children}
    </Skeleton>
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
          className={clsx(className, 'p-4 rounded-md overflow-x-auto text-xs')}
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
