import Avatar from 'boring-avatars'
import clsx from 'clsx'
import { ChangeEvent } from 'react'
import { toast } from 'react-hot-toast'
import { FaCropAlt } from 'react-icons/fa'

import { UploadFileButton } from '@src/components/FileInput'
import { useAuth } from '@src/context/AuthContext'
import { useConfirmModal } from '@src/context/ConfirmContext'
import { storage } from '@src/firebase'
import { useDisclosure } from '@src/hooks/useDisclosure'
import { useErrorToast } from '@src/hooks/useErrorToast'
import { CloseIcon } from '@src/icons/CloseIcon'
import {
  ImageCropModal,
  createImageFromFile,
  getCroppedImage,
} from '@src/profile/ImageCropModal'
import {
  useBigAvatar,
  useUserBigAvatar,
  useUserSmallAvatar,
} from '@src/profile/useAvartar'
import { Button } from '@src/ui/Button'
import { IconButton } from '@src/ui/IconButton'

export const FullAvatarUpload = () => {
  const cropModal = useDisclosure()
  const { user } = useAuth()
  const { url, fetchUrl: reloadBigAvatar } = useUserBigAvatar()
  const { fetchUrl: reloadSmallAvatar } = useUserSmallAvatar()

  const onError = useErrorToast()
  const onFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length === 0) return
    const file = e.target.files?.[0]
    if (file) {
      try {
        const image = await createImageFromFile(file)
        const croppedImage = await getCroppedImage(image)
        if (croppedImage) {
          onUpload(croppedImage)
        }
      } catch (e: any) {
        onError(e)
      }
    }
  }

  const onUpload = (file: File) => {
    if (user) {
      const uploadTask = storage
        .ref(`images/${user.id}.jpeg`)
        .put(file, { contentType: 'image/jpeg' })
      uploadTask.on(
        'state_changed',
        () => {
          // const progress = Math.round(
          //   (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          // )
          // setProgress(progress)
        },
        (error) => onError(error),
        () => {
          reloadBigAvatar()
          toast.success(
            <div>
              <b>อัปโหลดรูปสำเร็จ!</b>
              <p>กดรีเฟรชหากรูปของคุณยังไม่เปลี่ยน</p>
            </div>,
            { duration: 4000 }
          )
          setTimeout(() => {
            reloadSmallAvatar()
          }, 1000)
        }
      )
    }
  }

  const confirm = useConfirmModal()
  const onRemove = () => {
    if (!user) {
      return
    }
    confirm({
      cancleText: 'ยกเลิก',
      submitText: 'ยืนยัน',
      title: 'ยืนยันลบโปรไฟล์',
      subtitle: 'คุณยืนยันที่จะลบรูปโปรไฟล์ของคุณหรือไม่',
      onSubmit: async () => {
        try {
          await Promise.all([
            storage.ref(`images/${user.id}.jpeg`).delete(),
            storage.ref(`images/${user.id}_32.jpeg`).delete(),
          ])
          reloadBigAvatar()
          reloadSmallAvatar()
        } catch {}
      },
    })
  }

  return (
    <div>
      <div className="group relative w-80 flex-1">
        <AvatarImage
          url={url}
          name={user!.showName}
          className="group-hover:brightness-50"
        />
        {url && (
          <div className="invisible absolute top-1 right-1 flex gap-2 group-hover:visible">
            <IconButton
              icon={<CloseIcon />}
              size="xs"
              aria-label="remove-profile-picture"
              onClick={onRemove}
            />
          </div>
        )}
        <div className="invisible absolute top-1/2 right-1/2 flex translate-x-1/2 -translate-y-1/2 gap-2 group-hover:visible">
          <UploadFileButton accept=".png,.jpg,.jpeg" onChange={onFileSelect} />
          {url && (
            <>
              <Button
                size="sm"
                aria-label="edit-profile-image"
                leftIcon={<FaCropAlt />}
                onClick={cropModal.onOpen}
              >
                ตัดภาพ
              </Button>
              <ImageCropModal {...cropModal} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export interface FullAvatarProps {
  userId: number
  name: string
}

export const FullAvatar = ({ userId, name }: FullAvatarProps) => {
  const { url } = useBigAvatar(userId)
  return <AvatarImage url={url} name={name} />
}

export interface AvatarImageProps {
  url: string | undefined | null
  name: string
  className?: string
}

export const AvatarImage = ({ url, name, className }: AvatarImageProps) => {
  return url ? (
    <img
      className={clsx(
        'h-80 w-80 rounded-md bg-gray-300 object-cover',
        className
      )}
      src={url}
    />
  ) : (
    <div className={clsx('h-80 w-80 overflow-hidden  rounded-md', className)}>
      <Avatar
        square
        size={320}
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
}
