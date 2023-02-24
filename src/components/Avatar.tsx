import BoringAvatar from 'boring-avatars'
import clsx from 'clsx'
import { forwardRef } from 'react'

export type AvatarProps = {
  name: string
  src?: string
  className?: string
}
export const Avatar = forwardRef<HTMLAnchorElement, AvatarProps>(
  (props, ref) => {
    const { name, src, className, ...rest } = props
    return src ? (
      <img
        className={clsx('h-6 w-6 rounded-full', className)}
        src={src}
        {...rest}
      />
    ) : (
      <a className={className} ref={ref} {...rest}>
        <BoringAvatar
          size={24}
          name={name}
          variant="beam"
          colors={['#ff851b', '#17b4e9', '#41e241', '#ff4d4d']}
        />
      </a>
    )
  }
)
