import { useEffect } from 'react'
import { Accept, useDropzone } from 'react-dropzone'

import { useFileInput } from '@src/hooks/useFileInput'

const ACCEPTS: Accept = {
  'text/plain': ['.c', '.cc', '.cpp', '.py'],
}

export function useDropFile() {
  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({
      accept: ACCEPTS,
      multiple: false,
      noClick: true,
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
