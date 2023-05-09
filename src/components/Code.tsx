import clsx from 'clsx'
import Highlight, { Language, defaultProps } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/vsDark'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { FaRegShareSquare } from 'react-icons/fa'

import { API_HOST, APP_HOST } from '@src/config'
import { useClipboard } from '@src/hooks/useClipboard'
import { CopyIcon } from '@src/icons/CopyIcon'
import { useSubmissionWithSourceCode } from '@src/submission/queries'
import {
  SubmissionWithProblem,
  SubmissionWithSourceCode,
} from '@src/submission/types'
import { IconButton } from '@src/ui/IconButton'
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
  const { data: submission } = useSubmissionWithSourceCode(
    isOpen ? submissionId : 0
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
        {submission ? (
          <>
            <div>
              ผลตรวจ: <code>{submission.result}</code>
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
