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

import { useSubmission, SubmissionWithProblem } from '@src/utils/api/Submission'
import NextLink from 'next/link'
import { useEffect } from 'react'
import { CopyIcon } from '@chakra-ui/icons'
import { isGraded } from '@src/utils/hooks/useStatusColor'
import { ONE_SECOND, toThDate } from '@src/utils/hooks/useTimer'
export interface CodeModalProps extends Omit<ModalProps, 'children'> {
  submissionId: number
}

const language: Record<string, string> = {
  cpp: 'C++',
  c: 'C',
  python: 'Python',
}

export function CodeModal(props: CodeModalProps) {
  const { onClose, isOpen, submissionId } = props
  const { data: submission } = useSubmission(submissionId)
  const isLoaded = !!submission

  const { onCopy, hasCopied } = useClipboard(submission?.sourceCode ?? '')
  const toast = useToast()
  useEffect(() => {
    if (hasCopied) {
      toast({
        title: 'คัดลอกสำเร็จ',
        status: 'success',
        duration: 2000,
      })
    }
  }, [hasCopied])

  return (
    <Modal onClose={onClose} isOpen={isOpen} size="xl" preserveScrollBarGap>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Skeleton isLoaded={isLoaded} w={isLoaded ? 'auto' : 80} h={6}>
            <NextLink href={`/problem/${submission?.problem.id}`} passHref>
              <Link>ข้อ {submission?.problem.name}</Link>
            </NextLink>
          </Skeleton>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack>
            <div>
              <Skeleton isLoaded={isLoaded} w={isLoaded ? 'auto' : 40} h={6}>
                {submission && <Text>ผลตรวจ: {submission.result}</Text>}
              </Skeleton>
              <Skeleton isLoaded={isLoaded} w={isLoaded ? 'auto' : 20} h={6}>
                {submission && (
                  <Text>ภาษา: {language[submission.language]}</Text>
                )}
              </Skeleton>
              <Skeleton isLoaded={isLoaded} w={isLoaded ? 'auto' : 36} h={6}>
                {submission && (
                  <Text>
                    เวลารวม: {submission.timeUsed / ONE_SECOND} วินาที
                  </Text>
                )}
              </Skeleton>
              <Skeleton isLoaded={isLoaded} w={isLoaded ? 'auto' : 48} h={6}>
                {submission && (
                  <Text>เวลาที่ส่ง: {toThDate(submission.creationDate)}</Text>
                )}
              </Skeleton>
            </div>
            <Box position="relative">
              <Skeleton
                isLoaded={isLoaded}
                h={isLoaded ? 'auto' : 80}
                rounded="lg"
              >
                {submission && (
                  <CodeHighlight
                    code={submission.sourceCode}
                    language={submission.language}
                  />
                )}
              </Skeleton>
              <IconButton
                aria-label="copy"
                icon={<CopyIcon />}
                size="sm"
                onClick={onCopy}
                position="absolute"
                top={2}
                right={2}
              />
            </Box>
          </Stack>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}

export interface ErrorModalProp extends Omit<ModalProps, 'children'> {
  submission: SubmissionWithProblem
}

export function ErrorModal(props: ErrorModalProp) {
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

export function CodeHighlight(props: CodeHighlightProps) {
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
