import { IconButton } from '@chakra-ui/button'
import {
  Editable,
  EditableInput,
  EditablePreview,
  useEditableControls,
} from '@chakra-ui/editable'
import { EditIcon } from '@chakra-ui/icons'
import { HStack } from '@chakra-ui/layout'

import { useAuth } from '@src/context/AuthContext'
import { useHttp } from '@src/context/HttpContext'
import { useErrorToast } from '@src/hooks/useErrorToast'
import { useMutation } from '@src/hooks/useMutation'
import { editShowname } from '@src/user/queries'
import { UserProfile } from '@src/user/types'

interface EditableNameProps {
  userData: UserProfile
}

export const EditableName = (props: EditableNameProps) => {
  const { userData } = props
  const { user } = useAuth()

  // TODO: refractor refreshToken
  const http = useHttp()
  const { onError } = useErrorToast()
  const editShownameMutation = useMutation(editShowname)
  const onSubmit = async (showName: string) => {
    if (!user) return
    try {
      await editShownameMutation(user.id, showName)
      await http.refreshToken(null)
    } catch (e: any) {
      onError(e)
    }
  }

  function EditableControls() {
    const { isEditing, getEditButtonProps } = useEditableControls()

    return isEditing ? null : (
      <IconButton
        size="sm"
        icon={<EditIcon />}
        {...getEditButtonProps()}
        aria-label="edit"
      />
    )
  }

  return user?.id === userData.id ? (
    <Editable
      defaultValue={user?.showName}
      isPreviewFocusable={false}
      onSubmit={onSubmit}
    >
      <HStack>
        <EditablePreview />
        <EditableInput />
        <EditableControls />
      </HStack>
    </Editable>
  ) : (
    <>{userData?.showName}</>
  )
}
