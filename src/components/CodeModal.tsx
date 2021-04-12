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
  Spinner,
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
    <Modal onClose={onClose} isOpen={isOpen} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <NextLink href={`/problem/${submission?.problem.id}`} passHref>
            <Link>ข้อ {submission?.problem.name}</Link>
          </NextLink>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {submission ? (
            <Stack>
              <div>
                <Text>ผลตรวจ: {submission.result}</Text>
                <Text>ภาษา: {language[submission.language]}</Text>
                {isGraded(submission) && (
                  <Text>
                    เวลารวม: {submission.timeUsed / ONE_SECOND} วินาที
                  </Text>
                )}
                <HStack justify="space-between">
                  <Text>เวลาที่ส่ง: {toThDate(submission.creationDate)}</Text>
                </HStack>
              </div>
              <Box position="relative">
                <CodeHighlight
                  code={submission.sourceCode}
                  language={submission.language}
                />
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
          ) : (
            <Spinner />
          )}
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
          borderRadius="md"
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
