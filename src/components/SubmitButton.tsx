import { IconButton, IconButtonProps } from '@chakra-ui/react'
import { FaFileUpload } from 'react-icons/fa'
import { OrangeIconButton } from './OrangeButton'

export type SubmitButtonProps = Omit<IconButtonProps, 'aria-label'>

export const SubmitButton = (props: SubmitButtonProps) => {
  return (
    <IconButton aria-label="Upload file" icon={<FaFileUpload />} {...props} />
  )
}

export const OrangeSubmitButton = (props: SubmitButtonProps) => {
  return (
    <OrangeIconButton
      aria-label="Upload file"
      icon={<FaFileUpload />}
      {...props}
    />
  )
}
