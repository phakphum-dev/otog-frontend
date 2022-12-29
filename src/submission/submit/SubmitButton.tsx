import { FaFileUpload } from 'react-icons/fa'

import { IconButton, IconButtonProps } from '@src/ui/IconButton'

export type SubmitButtonProps = Omit<IconButtonProps, 'icon'>

export const SubmitButton = (props: SubmitButtonProps) => {
  return (
    <IconButton aria-label="Upload file" icon={<FaFileUpload />} {...props} />
  )
}

export const OrangeSubmitButton = (props: SubmitButtonProps) => {
  return (
    <IconButton
      colorScheme="otog"
      aria-label="Upload file"
      icon={<FaFileUpload />}
      {...props}
    />
  )
}
