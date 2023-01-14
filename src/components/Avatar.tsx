import BoringAvatar from 'boring-avatars'
import clsx from 'clsx'

export type AvatarProps = {
  name: string
  src?: string
  className?: string
}
export const Avatar = (props: AvatarProps) => {
  const { name, src, className } = props
  return src ? (
    <img className={clsx('h-6 w-6 rounded-full', className)} src={src} />
  ) : (
    <div className={className}>
      <BoringAvatar
        size={24}
        name={name}
        variant="beam"
        colors={['#ff851b', '#17b4e9', '#41e241', '#ff4d4d']}
      />
    </div>
  )
}
