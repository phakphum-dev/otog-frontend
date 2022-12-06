import NextLink from 'next/link'
import { FormEvent, useEffect } from 'react'

import { FileInput } from '../../components/FileInput'
import { submitProblem } from './queries'
import { useDropFile } from './useDropFile'

import {
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
  UseDisclosureReturn,
} from '@chakra-ui/react'

import { useLoading } from '@src/hooks/useLoading'
import { useMutation } from '@src/hooks/useMutation'
import { Problem } from '@src/problem/types'
import { Button } from '@src/ui/Button'

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

  const { file, resetFile, fileInputProps, getRootProps } = useDropFile()
  useEffect(() => {
    resetFile()
  }, [resetFile, problem.id])

  const submitProblemMutation = useMutation(submitProblem)
  const { isLoading, onLoad, onLoaded } = useLoading()
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading || !file) return
    try {
      onLoad()
      const language = new FormData(e.currentTarget).get('language') as string
      await submitProblemMutation(problem.id, file, language)
      resetFile()
      onSuccess?.()
      onClose()
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
              <div className="flex flex-col gap-2">
                <FormControl>
                  <FormLabel>อัปโหลด</FormLabel>
                  <FileInput name="sourceCode" {...fileInputProps} />
                </FormControl>
                <FormControl>
                  <FormLabel>ภาษา</FormLabel>
                  <Select name="language">
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="python">Python</option>
                  </Select>
                </FormControl>
              </div>
            </ModalBody>

            <ModalFooter>
              <HStack>
                <NextLink href={`/problem/${problem.id}`} passHref>
                  <Button as="a">{submitted ? 'แก้ไข' : 'ใหม่'}</Button>
                </NextLink>
                <Button colorScheme="otog" type="submit">
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
