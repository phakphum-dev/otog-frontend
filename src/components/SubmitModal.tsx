import { ChangeEvent, useEffect, useState } from 'react'
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
import { UploadFile } from './UploadFile'
import { ProblemDto } from '@src/utils/api/Problem'
import { OrangeButton } from './OrangeButton'
import { useHttp } from '@src/utils/api/HttpProvider'
import { useForm } from 'react-hook-form'
import { AxiosError } from 'axios'
import { useError } from '@src/utils/hooks/useError'
import { useRouter } from 'next/router'

export interface SubmitModal {
  problem: ProblemDto
  onClose: () => void
  isOpen: boolean
  onSuccess?: () => void
}

export interface SubmitReq {
  sourceCode: File
  language: 'c' | 'cpp' | 'python'
  contestId?: number
}

export function SubmitModal(props: SubmitModal) {
  const { problem, onClose, isOpen, onSuccess } = props
  const { register, handleSubmit } = useForm()
  const [file, setFile] = useState<File>()
  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length === 0) return
    setFile(e.target.files?.[0])
  }
  useEffect(() => {
    setFile(undefined)
  }, [problem.id])

  const http = useHttp()
  const [onError, toast] = useError()
  const onSubmit = async (entries: SubmitReq) => {
    if (file) {
      const formData = new FormData()
      Object.entries(entries).map(([key, val]) => {
        formData.append(key, val)
        // console.log(key, val)
      })
      try {
        await http.post(`submission/${problem.id}`, formData)
        onSuccess?.()
        onClose()
      } catch (e) {
        if (e.isAxiosError) {
          const error = e as AxiosError
          if (error.response?.status === 403) {
            toast({
              title: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
              status: 'warning',
              isClosable: true,
            })
          }
          return
        }
        onError(e)
      }
    }
  }

  const router = useRouter()
  const onNew = () => {
    router.push('problem/[id]', `problem/${problem.id}`)
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <ModalOverlay />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalContent>
          <ModalHeader>{problem.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>อัปโหลด</FormLabel>
              <UploadFile
                name="sourceCode"
                fileName={file?.name}
                onChange={onFileSelect}
                accept=".c,.cpp,.py"
                ref={register}
              />
            </FormControl>
            <FormControl>
              <FormLabel>ภาษา</FormLabel>
              <Select name="language" ref={register}>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="python" disabled>
                  Python
                </option>
              </Select>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <HStack>
              <Button onClick={onNew}>ใหม่</Button>
              <OrangeButton type="submit">ส่ง</OrangeButton>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}
