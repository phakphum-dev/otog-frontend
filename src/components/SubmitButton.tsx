import { IconButton, IconButtonProps } from '@chakra-ui/react'
import { FaFileUpload } from 'react-icons/fa'

export type SubmitButtonProps = Omit<IconButtonProps, 'aria-label'>

export function SubmitButton(props: SubmitButtonProps) {
  return (
    <IconButton aria-label="Upload file" icon={<FaFileUpload />} {...props} />
  )
}
