import NextLink from 'next/link'
import { FormEvent, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'

import { FileInput } from './FileInput'

import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  UseDisclosureReturn,
} from '@chakra-ui/react'

import { useHttp } from '@src/api/HttpProvider'
import { useErrorToast } from '@src/hooks/useError'
import { useFileInput } from '@src/hooks/useInput'
import { useLoading } from '@src/hooks/useLoading'
import { Problem } from '@src/hooks/useProblem'

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

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    accept: '.c,.cpp,.py',
    multiple: false,
  })

  const draggedFile = acceptedFiles[0]
  const inputProps = getInputProps({})
  const { file, fileName, resetFile, fileInputProps } = useFileInput(inputProps)
  useEffect(() => {
    if (draggedFile) {
      resetFile(draggedFile)
    }
  }, [resetFile, draggedFile])
  useEffect(() => {
    resetFile()
  }, [resetFile, problem])

  const http = useHttp()
  const { onError } = useErrorToast()
  const { isLoading, onLoad, onLoaded } = useLoading()
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading || !file) return
    try {
      onLoad()
      const formData = new FormData(e.currentTarget)
      formData.set('sourceCode', file)
      await http.post(`submission/problem/${problem.id}`, formData)
      resetFile()
      onSuccess?.()
      onClose()
    } catch (e: any) {
      onError(e)
    } finally {
      onLoaded()
    }
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <ModalOverlay />
      <div {...getRootProps()}>
        <form onSubmit={onSubmit}>
          <ModalContent>
            <ModalHeader>{problem.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack>
                <FormControl>
                  <FormLabel>อัปโหลด</FormLabel>
                  <FileInput
                    name="sourceCode"
                    fileName={fileName}
                    isDragActive={isDragActive}
                    {...fileInputProps}
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
      </div>
    </Modal>
  )
}
