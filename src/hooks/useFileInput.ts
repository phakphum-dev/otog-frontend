import { ChangeEvent, useCallback, useRef, useState } from 'react'
import { DropzoneInputProps } from 'react-dropzone'

export interface FileInputRef {
  value?: string
  onClick: () => void
}

export function useFileInput(inputProps?: DropzoneInputProps) {
  const [file, setFile] = useState<File>()
  const inputRef = useRef<FileInputRef>(null)
  const resetFile = useCallback((file?: File) => {
    setFile(file)
  }, [])
  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      resetFile(event.target.files?.[0])
    },
    [resetFile]
  )

  return {
    file,
    resetFile,
    fileInputProps: {
      fileName: file?.name,
      ...inputProps,
      ref: inputRef,
      onChange,
    },
  }
}
