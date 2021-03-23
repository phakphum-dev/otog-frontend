import { forwardRef, useEffect, useRef, ForwardedRef } from 'react'
import {
  Button,
  Input,
  InputGroup,
  InputProps,
  InputRightAddon,
} from '@chakra-ui/react'

export interface UploadFileProps extends InputProps {
  fileName?: string
}

export const UploadFile = forwardRef(
  (props: UploadFileProps, ref: ForwardedRef<HTMLInputElement>) => {
    const { fileName, ...rest } = props
    const inputRef = useRef<HTMLInputElement>(null)
    const openFileSelect = () => inputRef.current?.click()

    useEffect(() => {
      if (typeof ref === 'function') {
        ref(inputRef.current)
      } else if (ref) {
        ref.current = inputRef.current
      }
    }, [ref])

    return (
      <InputGroup>
        <Input type="file" ref={inputRef} display="none" {...rest} />
        <Input
          value={fileName ?? 'ยังไม่ได้เลือกไฟล์'}
          isReadOnly
          onClick={openFileSelect}
        />
        <InputRightAddon
          as={Button}
          fontWeight="normal"
          children="ค้นหาไฟล์"
          onClick={openFileSelect}
        />
      </InputGroup>
    )
  }
)
