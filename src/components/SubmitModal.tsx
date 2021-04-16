import { FormEvent, useEffect } from 'react'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalFooter,
  FormControl,
  FormLabel,
  Select,
  HStack,
  Button,
  Stack,
} from '@chakra-ui/react'
import { FileInput } from './FileInput'
import { Problem } from '@src/utils/api/Problem'
import { OrangeButton } from './OrangeButton'
import { useHttp } from '@src/utils/api/HttpProvider'
import { useToastError } from '@src/utils/hooks/useError'
import NextLink from 'next/link'
import { useFileInput } from '@src/utils/hooks/useInput'

export interface SubmitModalProps {
  problem: Problem
  onClose: () => void
  isOpen: boolean
  onSuccess?: () => void
}

export interface SubmitReq {
  sourceCode: File
  language: 'c' | 'cpp' | 'python'
  contestId?: number
}

export function SubmitModal(props: SubmitModalProps) {
  const { problem, onClose, isOpen, onSuccess } = props

  const { resetFileInput, fileProps } = useFileInput()
  useEffect(() => {
    resetFileInput()
  }, [problem])

  const http = useHttp()
  const { onError } = useToastError()
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await http.post(
        `submission/problem/${problem.id}`,
        new FormData(e.currentTarget)
      )
      resetFileInput()
      onSuccess?.()
      onClose()
    } catch (e) {
      onError(e)
    }
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <ModalOverlay />
      <form onSubmit={onSubmit}>
        <ModalContent>
          <ModalHeader>{problem.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              <FormControl>
                <FormLabel>อัปโหลด</FormLabel>
                <FileInput
                  isRequired
                  name="sourceCode"
                  accept=".c,.cpp,.py"
                  {...fileProps}
                />
              </FormControl>
              <FormControl>
                <FormLabel>ภาษา</FormLabel>
                <Select name="language">
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="python">Python</option>
                </Select>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <HStack>
              <NextLink href={`problem/${problem.id}`}>
                <Button>ใหม่</Button>
              </NextLink>
              <OrangeButton type="submit">ส่ง</OrangeButton>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}
