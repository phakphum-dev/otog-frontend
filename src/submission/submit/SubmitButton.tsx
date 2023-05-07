import { forwardRef } from 'react'
import { FaFileUpload } from 'react-icons/fa'

import { IconButton, IconButtonProps } from '@src/ui/IconButton'

export type SubmitButtonProps = Omit<IconButtonProps, 'icon'>

export const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(
  (props, ref) => {
    return (
      <IconButton
        aria-label="Upload file"
        variant="outline"
        icon={<FaFileUpload />}
        className="text-gray-600"
        {...props}
        ref={ref}
      />
    )
  }
)

export const OrangeSubmitButton = forwardRef<
  HTMLButtonElement,
  SubmitButtonProps
>((props, ref) => {
  return (
    <IconButton
      colorScheme="otog"
      aria-label="Upload file"
      icon={<FaFileUpload />}
      {...props}
      ref={ref}
    />
  )
})
