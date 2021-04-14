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
import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from '@chakra-ui/slider'

import { useAuth } from '@src/utils/api/AuthProvider'
import { storage } from '@src/utils/firebase'
import { useToastError } from '@src/utils/hooks/useError'
import { useState } from 'react'
import Cropper from 'react-easy-crop'
import { Area } from 'react-easy-crop/types'
import { OrangeButton } from './OrangeButton'

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
const BOX_SIZE = 320
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
      console.log(sourceArea)

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
        resolve(blob && new File([blob], 'tmp.png'))
      }, 'image/png')
    })
  }
  throw new Error(`This browser doesn't support 2D Context`)
}

export function ImageCropModal(props: ImageUploadModalProps) {
  const { isOpen, onClose } = props

  const { user, profileSrc, refreshProfilePic } = useAuth()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>()
  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const { onError } = useToastError()
  const uploadCroppedImage = async () => {
    if (user && profileSrc && croppedAreaPixels) {
      try {
        const image = await createImage(profileSrc)
        const croppedImage = await getCroppedImage(image, croppedAreaPixels)
        if (croppedImage) {
          const uploadTask = storage
            .ref(`images/${user.id}.png`)
            .put(croppedImage)
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              // const progress = Math.round(
              //   (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              // )
              // setProgress(progress)
            },
            (error) => {
              onError(error)
            },
            () => {
              refreshProfilePic()
              onClose()
              setZoom(1)
              setCrop({ x: 0, y: 0 })
            }
          )
        }
      } catch (e) {
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
          <Stack>
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
            <Slider
              min={1}
              max={3}
              onChange={setZoom}
              value={zoom}
              step={0.01}
              colorScheme="orange"
              focusThumbOnChange={false}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb boxSize={6} />
            </Slider>
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
