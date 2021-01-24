import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/react'
import { SubmissionDto } from '@src/utils/api/Submission'
import Highlight, { defaultProps } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/vsDark'

export interface CodeModalProps extends Omit<ModalProps, 'children'> {
  submission: SubmissionDto
}

export function CodeModal(props: CodeModalProps) {
  const { submission, onClose, isOpen } = props
  return (
    <Modal onClose={onClose} isOpen={isOpen} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>ข้อ {submission.problem.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Highlight
            {...defaultProps}
            code={submission.code}
            language={submission.language}
            theme={theme}
          >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <Box
                as="pre"
                className={className}
                style={style}
                padding={4}
                borderRadius={4}
                overflowY="auto"
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
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
