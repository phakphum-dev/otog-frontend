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
  UseDisclosureReturn,
} from '@chakra-ui/react'
import { FileInput } from './FileInput'
import { Problem } from '@src/hooks/useProblem'
import { useHttp } from '@src/api/HttpProvider'
import { useErrorToast } from '@src/hooks/useError'
import NextLink from 'next/link'
import { useFileInput } from '@src/hooks/useInput'
import { useLoading } from '@src/hooks/useLoading'

export interface SubmitModalProps extends UseDisclosureReturn {
  problem: Problem
  onSuccess?: () => void
  submitted?: boolean
}

export interface SubmitReq {
  sourceCode: File
  language: 'c' | 'cpp' | 'python'
  contestId?: number
}

export const SubmitModal = (props: SubmitModalProps) => {
  const { problem, onClose, isOpen, onSuccess, submitted = false } = props

  const { resetFileInput, fileProps } = useFileInput()
  useEffect(() => {
    resetFileInput()
  }, [problem.id])

  const http = useHttp()
  const { onError } = useErrorToast()
  const { isLoading, onLoad, onLoaded } = useLoading()
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isLoading) {
      try {
        onLoad()
        await http.post(
          `submission/problem/${problem.id}`,
          new FormData(e.currentTarget)
        )
        resetFileInput()
        onSuccess?.()
        onClose()
      } catch (e) {
        onError(e)
      } finally {
        onLoaded()
      }
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
              <NextLink href={`/problem/${problem.id}`} passHref>
                <Button as="a">{submitted ? 'แก้ไข' : 'ใหม่'}</Button>
              </NextLink>
              <Button variant="otog" type="submit">
                ส่ง
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}
