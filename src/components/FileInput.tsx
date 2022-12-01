import clsx from 'clsx'
import {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { DropzoneInputProps } from 'react-dropzone'
import { FaUpload } from 'react-icons/fa'

import {
  IconButton,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
} from '@chakra-ui/react'

import { FileInputRef } from '@src/hooks/useFileInput'
import { Button } from '@src/ui/Button'

export type UploadFileProps = DropzoneInputProps & {
  fileName?: string
  isDragActive?: boolean
  variant?: 'sm' | 'md'
}

export function useInputRef(ref: ForwardedRef<FileInputRef>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const displayInputRef = useRef<HTMLInputElement>(null)
  const onFocus = () => {
    displayInputRef.current?.focus()
  }
  const onClick = () => {
    if (!inputRef.current) return
    inputRef.current.value = ''
    inputRef.current.click()
    onFocus()
  }
  useImperativeHandle(ref, () => ({ onClick }))
  return { inputRef, displayInputRef, onClick, onFocus }
}

export const FileInput = forwardRef(
  (props: UploadFileProps, ref: ForwardedRef<FileInputRef>) => {
    const { isDragActive = false, fileName, variant = 'md', ...rest } = props
    const { inputRef, displayInputRef, onClick, onFocus } = useInputRef(ref)
    useEffect(() => {
      if (isDragActive) {
        onFocus()
      }
    }, [isDragActive, onFocus])
    return (
      <InputGroup size={variant}>
        <input type="file" hidden {...rest} ref={inputRef} />
        <Input
          ref={displayInputRef}
          cursor="pointer"
          value={isDragActive ? 'วางไฟล์ที่นี่' : fileName ?? ''}
          placeholder="ยังไม่ได้เลือกไฟล์"
          isReadOnly
          onClick={onClick}
        />
        <InputRightElement w={100} zIndex={0} justifyContent="end">
          <Button
            className={clsx(
              '!rounded-l-none !font-normal text-gray-60 dark:text-white',
              variant === 'md' && '!rounded-md',
              variant === 'sm' && '!rounded-sm'
            )}
            onClick={onClick}
            size={variant}
          >
            ค้นหาไฟล์
          </Button>
        </InputRightElement>
      </InputGroup>
    )
  }
)

export const UploadFileButton = forwardRef(
  (props: InputProps, ref: ForwardedRef<FileInputRef>) => {
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
