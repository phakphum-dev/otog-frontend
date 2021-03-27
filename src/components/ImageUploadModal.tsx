import { Button } from '@chakra-ui/button'
import { Box, HStack, Stack } from '@chakra-ui/layout'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal'

import { UploadFile } from '@src/components/UploadFile'
import { useAuth } from '@src/utils/api/AuthProvider'
import { storage } from '@src/utils/firebase'
import { ChangeEvent, useState } from 'react'
import Cropper from 'react-easy-crop'
import { Area } from 'react-easy-crop/types'
import { OrangeButton } from './OrangeButton'
import { SubmitButton } from './SubmitButton'

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

// ref: https://codesandbox.io/s/q8q1mnr01w
const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 * @param {File} image - Image File url
 * @param {Object} pixelCrop - pixelCrop Object provided by react-easy-crop
 * @param {number} rotation - optional rotation parameter
 */
async function getCroppedImg(imageSrc: string, pixelCrop: Area) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (ctx) {
    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    // set each dimensions to double largest dimension to allow for a safe area for the
    // image to rotate in without being clipped by canvas context
    canvas.width = safeArea
    canvas.height = safeArea

    // translate canvas context to a central location on image to allow rotating around the center.
    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.translate(-safeArea / 2, -safeArea / 2)

    // draw rotated image and store data.
    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    )
    const data = ctx.getImageData(0, 0, safeArea, safeArea)

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // paste generated rotate image with correct offsets for x,y crop values.
    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    )

    // As a blob
    return new Promise<File | null>((resolve) => {
      canvas.toBlob((blob) => {
        // TODO: convert to png maybe
        resolve(blob && new File([blob], 'tmp.jpg'))
      }, 'image/jpeg')
    })
  }
}

export function ImageUploadModal(props: ImageUploadModalProps) {
  const { isOpen, onClose } = props

  const { user, profileSrc, refreshProfilePic } = useAuth()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>()
  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const [file, setFile] = useState<File>()
  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length === 0) return
    setFile(e.target.files?.[0])
  }

  const onUpload = () => {
    if (user && file) {
      const uploadTask = storage.ref(`images/${user.id}`).put(file)
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // const progress = Math.round(
          //   (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          // )
          // setProgress(progress)
        },
        (error) => {
          console.log(error)
        },
        () => {
          refreshProfilePic()
          setCrop({ x: 0, y: 0 })
          setZoom(1)
        }
      )
    }
  }

  const uploadCroppedImage = async () => {
    if (user && profileSrc && croppedAreaPixels) {
      const imageCropped = await getCroppedImg(profileSrc, croppedAreaPixels)
      //   console.log(imageCropped)
      if (imageCropped) {
        const uploadTask = storage.ref(`images/${user.id}`).put(imageCropped)
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // const progress = Math.round(
            //   (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            // )
            // setProgress(progress)
          },
          (error) => {
            console.log(error)
          },
          () => {
            refreshProfilePic()
            onClose()
          }
        )
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
          <Stack>
            {profileSrc && (
              <Box position="relative" width="100%" height="400px">
                <Cropper
                  aspect={1}
                  image={profileSrc}
                  crop={crop}
                  onCropChange={setCrop}
                  zoom={zoom}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  cropShape="round"
                />
              </Box>
            )}
            <HStack spacing={4}>
              <UploadFile fileName={file?.name} onChange={onFileSelect} />
              <SubmitButton onClick={onUpload} />
            </HStack>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <HStack>
            <OrangeButton onClick={uploadCroppedImage}>เสร็จสิ้น</OrangeButton>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
