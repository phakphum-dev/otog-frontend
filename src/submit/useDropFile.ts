import { useEffect } from 'react'
import { useDropzone } from 'react-dropzone'

import { useFileInput } from '@src/hooks/useFileInput'

interface UseDropFileOptions {
  accept?: string
}

export function useDropFile({
  accept = '.c,.cpp,.py',
}: UseDropFileOptions = {}) {
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    accept,
    multiple: false,
  })

  const draggedFile = acceptedFiles[0]
  const inputProps = getInputProps({})
  const { file, resetFile, fileInputProps } = useFileInput(inputProps)
  useEffect(() => {
    if (draggedFile) {
      resetFile(draggedFile)
    }
  }, [resetFile, draggedFile])

  return {
    file,
    resetFile,
    getRootProps,
    fileInputProps: {
      ...fileInputProps,
      isDragActive,
    },
  }
}
