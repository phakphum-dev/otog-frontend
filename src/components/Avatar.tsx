import BoringAvatar from 'boring-avatars'
import clsx from 'clsx'
import { forwardRef } from 'react'

export type AvatarProps = {
  name: string
  src?: string | null
  className?: string
}
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>((props, ref) => {
  const { name, src, className, ...rest } = props
  return src ? (
    <img
      alt="avatar"
      className={clsx('h-6 w-6 min-w-6 rounded-full object-cover', className)}
      src={src}
      {...rest}
    />
  ) : (
    <div
      className={clsx('min-w-fit overflow-hidden rounded-full', className)}
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
    </div>
  )
})
