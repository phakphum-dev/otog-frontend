import {
  Box,
  HStack,
  IconButton,
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
  Stack,
  Text,
  useClipboard,
  useToast,
} from '@chakra-ui/react'
import Highlight, { defaultProps, Language } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/vsDark'

import {
  useSubmission,
  SubmissionWithProblem,
  SubmissionWithSourceCode,
} from '@src/utils/api/Submission'
import { PropsWithChildren, useEffect } from 'react'
import { CopyIcon } from '@chakra-ui/icons'
import { ONE_SECOND, toThDate } from '@src/utils/hooks/useTimer'
import { FaRegShareSquare } from 'react-icons/fa'
import { API_HOST, APP_HOST } from '@src/utils/config'

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
  const isLoaded = !!submission

  const { onCopy, hasCopied } = useClipboard(submission?.sourceCode ?? '')
  const toast = useToast()
  useEffect(() => {
    if (hasCopied) {
      toast({
        title: 'คัดลอกไปยังคลิปบอร์ดแล้ว',
        status: 'success',
        duration: 2000,
      })
    }
  }, [hasCopied])

  const { onCopy: onLinkCopy, hasCopied: hasLinkCopied } = useClipboard(
    submission ? `${APP_HOST}submission/${submission.id}` : ''
  )
  useEffect(() => {
    if (hasLinkCopied) {
      toast({
        title: 'เปิดการแชร์',
        description: 'คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว',
        status: 'info',
      })
    }
  }, [hasLinkCopied])

  const TextSkeleton = ({
    h = 4,
    w,
    children,
  }: PropsWithChildren<{ h?: number; w: number }>) => (
    <Skeleton
      isLoaded={isLoaded}
      w={isLoaded ? 'auto' : w}
      h={isLoaded ? 'auto' : h}
      mt={isLoaded ? 0 : 2}
    >
      {children}
    </Skeleton>
  )

  return (
    <Modal onClose={onClose} isOpen={isOpen} size="xl" preserveScrollBarGap>
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
          <Stack>
            <div>
              <TextSkeleton w={40}>
                {submission && <Text>ผลตรวจ: {submission.result}</Text>}
              </TextSkeleton>
              <TextSkeleton w={20}>
                {submission && (
                  <Text>ภาษา: {language[submission.language]}</Text>
                )}
              </TextSkeleton>
              <TextSkeleton w={36}>
                {submission && (
                  <Text>
                    เวลารวม: {submission.timeUsed / ONE_SECOND} วินาที
                  </Text>
                )}
              </TextSkeleton>

              <TextSkeleton w={48}>
                {submission && (
                  <Text>เวลาที่ส่ง: {toThDate(submission.creationDate)}</Text>
                )}
              </TextSkeleton>
              <TextSkeleton w={24}>
                {submission && <Text>ผู้ส่ง: {submission.user.showName}</Text>}
              </TextSkeleton>
            </div>
            <Box position="relative">
              <Skeleton
                isLoaded={isLoaded}
                h={isLoaded ? 'auto' : 80}
                rounded="lg"
              >
                {submission && (
                  <>
                    <CodeHighlight
                      code={submission.sourceCode}
                      language={submission.language}
                    />
                    <HStack position="absolute" top={2} right={2}>
                      {/* <IconButton
                        aria-label="share"
                        icon={<FaRegShareSquare />}
                        size="sm"
                        onClick={onLinkCopy}
                      /> */}
                      <IconButton
                        aria-label="copy"
                        icon={<CopyIcon />}
                        size="sm"
                        onClick={onCopy}
                      />
                    </HStack>
                  </>
                )}
              </Skeleton>
            </Box>
          </Stack>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}

export interface CodeSubmissionProps {
  submission: SubmissionWithSourceCode
}

export const CodeSubmission = (props: CodeSubmissionProps) => {
  const { submission } = props

  const { onCopy, hasCopied } = useClipboard(submission.sourceCode)

  const toast = useToast()
  useEffect(() => {
    if (hasCopied) {
      toast({
        title: 'คัดลอกไปยังคลิปบอร์ดแล้ว',
        status: 'success',
        duration: 2000,
      })
    }
  }, [hasCopied])

  const { onCopy: onLinkCopy, hasCopied: hasLinkCopied } = useClipboard(
    `${APP_HOST}submission/${submission.id}`
  )
  useEffect(() => {
    if (hasLinkCopied) {
      toast({
        title: 'เปิดการแชร์',
        description: 'คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว',
        status: 'info',
      })
    }
  }, [hasLinkCopied])

  return (
    <Stack>
      <div>
        <Link
          isExternal
          href={`${API_HOST}problem/doc/${submission?.problem.id}`}
        >
          ข้อ: {submission?.problem.name}
        </Link>
        <Text>ผลตรวจ: {submission.result}</Text>
        <Text>ภาษา: {language[submission.language]}</Text>
        <Text>เวลารวม: {submission.timeUsed / ONE_SECOND} วินาที</Text>
        <Text>เวลาที่ส่ง: {toThDate(submission.creationDate)}</Text>
        <Text>ผู้ส่ง: {submission.user.showName}</Text>
      </div>
      <Box position="relative">
        <CodeHighlight
          code={submission.sourceCode}
          language={submission.language}
        />
        <HStack position="absolute" top={2} right={2}>
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
        </HStack>
      </Box>
    </Stack>
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
        <Box
          as="pre"
          className={className}
          style={{ ...style, tabSize: 4 }}
          padding={4}
          rounded="md"
          overflowX="auto"
          fontSize="12px"
        >
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </Box>
      )}
    </Highlight>
  )
}
