import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
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
} from '@chakra-ui/react'
import { FileInput } from './FileInput'
import { Problem } from '@src/utils/api/Problem'
import { OrangeButton } from './OrangeButton'
import { useHttp } from '@src/utils/api/HttpProvider'
import { useToastError } from '@src/utils/error'
import NextLink from 'next/link'

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

  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File>()
  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length === 0) return
    setFile(e.target.files?.[0])
  }
  useEffect(() => {
    setFile(undefined)
  }, [problem.id])

  const [language, setLanguage] = useState<string>('cpp')
  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value)
  }

  const http = useHttp()
  const { onError } = useToastError()
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (file) {
      const formData = new FormData()
      formData.append('language', language)
      formData.append('sourceCode', file)
      try {
        await http.post(`submission/problem/${problem.id}`, formData)
        setFile(undefined)
        if (inputRef.current) {
          inputRef.current.value = ''
        }
        onSuccess?.()
        onClose()
      } catch (e) {
        onError(e)
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
            <FormControl>
              <FormLabel>อัปโหลด</FormLabel>
              <FileInput
                name="sourceCode"
                fileName={file?.name}
                onChange={onFileSelect}
                accept=".c,.cpp,.py"
              />
            </FormControl>
            <FormControl>
              <FormLabel>ภาษา</FormLabel>
              <Select name="language" onChange={onSelectChange}>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="python">Python</option>
              </Select>
            </FormControl>
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
