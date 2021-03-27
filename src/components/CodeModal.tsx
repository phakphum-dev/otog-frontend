import {
  Box,
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
} from '@chakra-ui/react'
import Highlight, { defaultProps, Language } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/vsDark'

import { useSubmission, SubmissionDto } from '@src/utils/api/Submission'
import { API_HOST } from '@src/utils/api'
export interface CodeModalProps extends Omit<ModalProps, 'children'> {
  submissionId: number
}

export function CodeModal(props: CodeModalProps) {
  const { onClose, isOpen, submissionId } = props
  const { data: submission } = useSubmission(submissionId)

  return (
    <Modal onClose={onClose} isOpen={isOpen} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Link
            href={`${API_HOST}problem/doc/${submission?.problem.id}`}
            target="_blank"
          >
            ข้อ {submission?.problem.name}
          </Link>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {submission ? (
            <Stack>
              <div>
                <Text>ผลตรวจ: {submission.result}</Text>
                <Text>ภาษา: {submission.language}</Text>
                {!submission.isGrading && (
                  <Text>เวลารวม: {submission.timeUsed / 1000} วินาที</Text>
                )}
                <Text>
                  เวลาที่ส่ง:{' '}
                  {new Date(submission.creationDate).toLocaleDateString(
                    'th-TH',
                    {
                      hour: 'numeric',
                      minute: 'numeric',
                      second: 'numeric',
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                    }
                  )}
                </Text>
                <Text></Text>
              </div>
              <CodeHighlight
                code={submission.sourceCode}
                language={submission.language}
              />
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
  submission: SubmissionDto
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
          style={style}
          padding={4}
          borderRadius={4}
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
