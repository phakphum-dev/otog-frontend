import produce from 'immer'
import {
  Dispatch,
  ProviderProps,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'
import { toast } from 'react-hot-toast'
import { Descendant } from 'slate'

import {
  createAnnouncement,
  deleteAnnouncemet,
  updateAnnouncement,
  useAnnouncements,
} from '../queries'
import { Announcement } from '../types'
import { createEmptyAnnouncement } from './utils'

import { useConfirmModal } from '@src/context/ConfirmContext'
import { useMutation } from '@src/hooks/useMutation'

export type AnnouncementProviderProps = {
  announcements: Announcement[]
  setAnnouncements: Dispatch<SetStateAction<Announcement[]>>
  filteredAnnouncements: Announcement[]
}

export type AnnouncementValueProps = {
  announcements: Announcement[]
  filteredAnnouncements: Announcement[]
  currentIndex: number
  currentAnnouncement: Announcement
  onChange: (value: Descendant[]) => void
  nextIndex: () => void
  prevIndex: () => void
  insertIndex: () => void
  deleteIndex: () => void
  toggleShow: () => void
  onSave: () => void
  showIndex: number
  nextShowIndex: () => void
}

const AnnouncementContext = createContext<AnnouncementValueProps>(
  {} as AnnouncementValueProps
)

export const useAnnouncementContext = () => useContext(AnnouncementContext)
export const AnnouncementProvider = (
  props: ProviderProps<AnnouncementProviderProps>
) => {
  const {
    value: { announcements, setAnnouncements, filteredAnnouncements },
    children,
  } = props

  const { mutate } = useAnnouncements()

  const [index, setIndex] = useState(0)
  const [showIndex, setShowIndex] = useState(0)
  const currentAnnouncement = announcements[index]

  const nextShowIndex = useCallback(() => {
    const newIndex = (showIndex + 1) % filteredAnnouncements.length
    setShowIndex(newIndex)
    const matchedIndex = announcements.findIndex(
      (announcement) => announcement.id === filteredAnnouncements[newIndex].id
    )
    if (matchedIndex !== -1) setIndex(matchedIndex)
  }, [showIndex, filteredAnnouncements, announcements])

  const nextIndex = useCallback(() => {
    const newIndex = (index + 1) % announcements.length
    setIndex(newIndex)
    const matchedIndex = filteredAnnouncements.findIndex(
      (announcement) => announcement.id === announcements[newIndex].id
    )
    if (matchedIndex !== -1) setShowIndex(matchedIndex)
  }, [announcements, index, filteredAnnouncements])

  const prevIndex = useCallback(() => {
    const newIndex = (index + announcements.length - 1) % announcements.length
    setIndex(newIndex)
    const matchedIndex = filteredAnnouncements.findIndex(
      (announcement) => announcement.id === announcements[newIndex].id
    )
    if (matchedIndex !== -1) setShowIndex(matchedIndex)
  }, [announcements, filteredAnnouncements, index])

  const onChange = useCallback(
    (value: Descendant[]) => {
      setAnnouncements(
        produce((announcements) => {
          announcements[index].value = value
        })
      )
    },
    [setAnnouncements, index]
  )

  const updateAnnouncementMutaion = useMutation(updateAnnouncement)
  const onSave = useCallback(async () => {
    try {
      const announcementData = await updateAnnouncementMutaion(
        announcements[index].id,
        announcements[index]
      )
      await mutate(
        produce((announcements) => {
          announcements[index] = announcementData
        })
      )
      toast.success(`บันทึกประกาศ #${announcements[index].id} สำเร็จ`)
    } catch {}
  }, [announcements, index, updateAnnouncementMutaion, mutate])

  const createAnnouncementMutation = useMutation(createAnnouncement)
  const insertIndex = useCallback(async () => {
    try {
      const announcementData = await createAnnouncementMutation(
        createEmptyAnnouncement()
      )
      await mutate(
        produce((announcements) => {
          announcements.push(announcementData)
        })
      )
    } finally {
      setIndex(announcements.length)
    }
  }, [announcements, mutate, createAnnouncementMutation])

  const deleteAnnouncementMutation = useMutation(deleteAnnouncemet)
  const confirm = useConfirmModal()
  const deleteIndex = useCallback(async () => {
    confirm({
      title: `ยืนยันลบการประกาศ`,
      subtitle: `คุณต้องการที่จะลบประกาศ #${announcements[index].id} ใช่หรือไม่ ?`,
      submitText: 'ยืนยัน',
      cancleText: 'ยกเลิก',
      onSubmit: async () => {
        try {
          await deleteAnnouncementMutation(announcements[index].id)
        } finally {
          prevIndex()
          await mutate()
        }
      },
    })
  }, [
    deleteAnnouncementMutation,
    announcements,
    index,
    prevIndex,
    mutate,
    confirm,
  ])

  const toggleShow = useCallback(async () => {
    const show = !announcements[index].show
    setAnnouncements(
      produce((announcements) => {
        announcements[index].show = show
      })
    )
    if (show) {
      const matchedIndex =
        announcements
          ?.filter(
            (announcement) =>
              announcement.show || announcement.id === announcements[index].id
          )
          .findIndex(
            (announcement) => announcement.id === announcements[index].id
          ) ?? -1
      if (matchedIndex !== -1) setShowIndex(matchedIndex)
    } else {
      setShowIndex(
        (showIndex) => (showIndex + 1) % filteredAnnouncements.length
      )
    }
  }, [setAnnouncements, index, announcements, filteredAnnouncements])

  const value: AnnouncementValueProps = {
    currentIndex: index,
    filteredAnnouncements,
    announcements,
    currentAnnouncement,
    nextIndex,
    prevIndex,
    onChange,
    insertIndex,
    deleteIndex,
    toggleShow,
    onSave,
    showIndex,
    nextShowIndex,
  }
  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  )
}
