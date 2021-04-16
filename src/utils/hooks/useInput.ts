import { ChangeEvent, useRef, useState } from 'react'

export function useFileInput() {
  const [file, setFile] = useState<File>()
  const onChange = ({ target: { files } }: ChangeEvent<HTMLInputElement>) => {
    setFile(files?.[0])
  }
  const ref = useRef<HTMLInputElement>(null)
  const resetFileInput = () => {
    setFile(undefined)
    if (ref.current) {
      ref.current.value = ''
    }
  }
  return {
    file,
    setFile,
    resetFileInput,
    fileProps: { ref, onChange, fileName: file?.name },
  }
}
