import { ChangeEvent, useCallback, useEffect, useState } from 'react'
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
  Button,
} from '@chakra-ui/react'
import { UploadFile } from './UploadFile'
import { ProblemDto } from '@src/utils/api/Problem'

export interface SubmitModal {
  problem: ProblemDto
  onClose: () => void
  isOpen: boolean
}

export const SubmitModal: React.FC<SubmitModal> = (props) => {
  const { problem, onClose, isOpen } = props

  const [file, setFile] = useState<File>()
  const onFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length === 0) return
    setFile(e.target.files?.[0])
  }, [])
  useEffect(() => {
    setFile(undefined)
  }, [problem.id])

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{problem.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form>
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
          <Button onClick={onClose}>ส่ง</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
