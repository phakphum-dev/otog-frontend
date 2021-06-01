import { ForwardedRef, forwardRef, useEffect, useRef } from 'react'
import {
  Button,
  IconButton,
  Input,
  InputGroup,
  InputGroupProps,
  InputProps,
  InputRightAddon,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaUpload } from 'react-icons/fa'

export interface UploadFileProps extends InputProps {
  fileInputProps: {
    fileName?: string
  }
  inputGroupProps?: InputGroupProps
}

export function useInputRef(ref: ForwardedRef<HTMLInputElement>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const onClick = () => inputRef.current?.click()
  useEffect(() => {
    if (typeof ref === 'function') {
      ref(inputRef.current)
    } else if (ref) {
      ref.current = inputRef.current
    }
  }, [ref])
  return { inputRef, onClick }
}

export const FileInput = forwardRef(
  (props: UploadFileProps, ref: ForwardedRef<HTMLInputElement>) => {
    const { fileInputProps, inputGroupProps, ...rest } = props
    const { fileName } = fileInputProps
    const { inputRef, onClick } = useInputRef(ref)
    return (
      <InputGroup {...inputGroupProps}>
        <Input type="file" ref={inputRef} display="none" {...rest} />
        <Input
          value={fileName ?? ''}
          placeholder="ยังไม่ได้เลือกไฟล์"
          isReadOnly
          onClick={onClick}
        />
        <InputRightAddon
          as={Button}
          color={useColorModeValue('gray.600', 'white')}
          fontWeight="normal"
          children="ค้นหาไฟล์"
          onClick={onClick}
        />
      </InputGroup>
    )
  }
)

export const UploadFileButton = forwardRef(
  (props: InputProps, ref: ForwardedRef<HTMLInputElement>) => {
    const { inputRef, onClick } = useInputRef(ref)
    return (
      <>
        <IconButton
          size="xs"
          aria-label="edit-profile-image"
          icon={<FaUpload />}
          onClick={onClick}
        />
        <Input type="file" ref={inputRef} display="none" {...props} />
      </>
    )
  }
)
