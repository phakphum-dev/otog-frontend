import { useState } from 'react'
import Cropper from 'react-easy-crop'
import { Area } from 'react-easy-crop/types'
import { mutate } from 'swr'

import { useAuth } from '@src/context/AuthContext'
import { storage } from '@src/firebase'
import { useErrorToast } from '@src/hooks/useErrorToast'
import { useUserProfilePic } from '@src/profile/useProfilePic'
import { Button } from '@src/ui/Button'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@src/ui/Modal'

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

// ref: https://codesandbox.io/s/q8q1mnr01w
export const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

export const createImageFromFile = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    const fileReader = new FileReader()
    fileReader.onload = (event) => {
      image.src = event.target?.result as string
    }
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    fileReader.readAsDataURL(file)
  })

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 * @param {File} image - Image File url
 * @param {Object} pixelCrop - pixelCrop Object provided by react-easy-crop
 * @param {number} rotation - optional rotation parameter
 */
const BOX_SIZE = 320 * 2
export async function getCroppedImage(
  image: HTMLImageElement,
  sourceArea?: Area
) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (context) {
    if (sourceArea) {
      canvas.width = BOX_SIZE
      canvas.height = BOX_SIZE

      context.drawImage(
        image,
        sourceArea.x,
        sourceArea.y,
        sourceArea.width,
        sourceArea.height,
        0,
        0,
        BOX_SIZE,
        BOX_SIZE
      )
    } else {
      const sWidth = image.naturalWidth
      const sHeight = image.naturalHeight
      const size = Math.min(sWidth, sHeight)
      const dWidth = (sWidth / size) * BOX_SIZE
      const dHeight = (sHeight / size) * BOX_SIZE
      canvas.width = dWidth
      canvas.height = dHeight
      context.drawImage(image, 0, 0, sWidth, sHeight, 0, 0, dWidth, dHeight)
    }

    // As a blob
    return new Promise<File | null>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob && new File([blob], 'tmp.jpeg'))
      }, 'image/jpeg')
    })
  }
  throw new Error(`This browser doesn't support 2D Context`)
}

export const ImageCropModal = (props: ImageUploadModalProps) => {
  const { isOpen, onClose } = props

  const { user } = useAuth()
  const { url, fetchUrl } = useUserProfilePic()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>()
  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const onError = useErrorToast()
  const uploadCroppedImage = async () => {
    if (user && url && croppedAreaPixels) {
      try {
        const image = await createImage(url)
        const croppedImage = await getCroppedImage(image, croppedAreaPixels)
        if (croppedImage) {
          const uploadTask = storage
            .ref(`images/${user.id}.jpeg`)
            .put(croppedImage, { contentType: 'image/jpeg' })
          uploadTask.on(
            'state_changed',
            () => {
              // const progress = Math.round(
              //   (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              // )
              // setProgress(progress)
            },
            (error) => {
              onError(error)
            },
            () => {
              fetchUrl()
              onClose()
              setZoom(1)
              setCrop({ x: 0, y: 0 })
              setTimeout(() => {
                mutate([user.id, true])
              }, 1000)
            }
          )
        }
      } catch (e: any) {
        onError(e)
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>แก้ไข</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div className="flex flex-col gap-2">
            <div className="relative w-full h-[400px]">
              <Cropper
                aspect={1}
                image={url}
                crop={crop}
                onCropChange={setCrop}
                zoom={zoom}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
              />
            </div>
            <input
              className="mt-2 w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              type="range"
              min={1}
              max={3}
              onChange={(e) => setZoom(Number(e.target.value))}
              value={zoom}
              step={0.01}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex gap-2">
            <Button colorScheme="otog" onClick={uploadCroppedImage}>
              เสร็จสิ้น
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
