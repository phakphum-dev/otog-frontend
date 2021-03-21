import { ChangeEvent, useEffect, useRef, useState } from 'react'
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
} from '@chakra-ui/react'
import { UploadFile } from './UploadFile'
import { ProblemDto } from '@src/utils/api/Problem'
import { OrangeButton } from './OrangeButton'
import { useHttp } from '@src/utils/api/HttpProvider'
import { useError } from '@src/utils/hooks/useError'

export interface SubmitModal {
  problem: ProblemDto
  onClose: () => void
  isOpen: boolean
}

export function SubmitModal(props: SubmitModal) {
  const { problem, onClose, isOpen } = props

  const [file, setFile] = useState<File>()
  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length === 0) return
    setFile(e.target.files?.[0])
  }
  useEffect(() => {
    setFile(undefined)
  }, [problem.id])

  const formRef = useRef<HTMLFormElement>(null)
  const http = useHttp()
  const [onError] = useError()

  const onSubmit = async () => {
    if (formRef.current && file) {
      const formData = new FormData(formRef.current)
      // console.log(Array.from(formData.entries()))
      try {
        await http.post(`submit/${problem.id}`, formData)
      } catch (e) {
        onError(e)
      }
    }
    onClose()
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{problem.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form ref={formRef}>
            <FormControl>
              <FormLabel>อัปโหลด</FormLabel>
              <UploadFile
                name="file"
                fileName={file?.name}
                onChange={onFileSelect}
                accept=".c,.cpp,.py"
              />
            </FormControl>
            <FormControl>
              <FormLabel>ภาษา</FormLabel>
              <Select name="fileLang">
                <option value="C++">C++</option>
                <option value="C">C</option>
                <option value="Python" disabled>
                  Python
                </option>
              </Select>
            </FormControl>
          </form>
        </ModalBody>

        <ModalFooter>
          <OrangeButton onClick={onSubmit}>ส่ง</OrangeButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
