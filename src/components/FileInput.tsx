import {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { DropzoneInputProps } from 'react-dropzone'
import { FaUpload } from 'react-icons/fa'

import { FileInputRef } from '@src/hooks/useFileInput'
import { Button } from '@src/ui/Button'
import { IconButton } from '@src/ui/IconButton'
import { Input, InputProps } from '@src/ui/Input'

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
      <div className="flex relative w-full">
        <input type="file" hidden {...rest} ref={inputRef} />
        <Input
          ref={displayInputRef}
          className="cursor-pointer focus:z-10"
          value={isDragActive ? 'วางไฟล์ที่นี่' : fileName ?? ''}
          placeholder="ยังไม่ได้เลือกไฟล์"
          onClick={onClick}
          variant={variant}
          readOnly
        />
        <div className="w-[100px] z-0 flex items-center justify-end absolute top-0 right-0">
          <Button
            className="rounded-l-none !font-normal text-gray-600 dark:text-white relative"
            onClick={onClick}
            size={variant}
          >
            ค้นหาไฟล์
          </Button>
        </div>
      </div>
    )
  }
)

export const UploadFileButton = forwardRef<FileInputRef, InputProps>(
  (props, ref) => {
    const { inputRef, onClick } = useInputRef(ref)
    return (
      <>
        <IconButton
          size="xs"
          aria-label="edit-profile-image"
          icon={<FaUpload />}
          onClick={onClick}
        />
        <Input type="file" className="hidden" {...props} ref={inputRef} />
      </>
    )
  }
)
