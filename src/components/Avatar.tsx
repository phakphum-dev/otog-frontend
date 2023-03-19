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
      <a
        className={clsx('overflow-hidden rounded-full', className)}
        ref={ref}
        {...rest}
      >
        <BoringAvatar
          square
          size={24}
          name={name}
          variant="beam"
          colors={[
            '#ffd5ae',
            '#b1e9fc',
            '#b9f6ba',
            '#ffb1b2',
            '#ffe0ae',
            '#CBD5E0',
          ]}
        />
      </a>
    )
  }
)
