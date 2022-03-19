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
import { Descendant } from 'slate'

import { Announcement } from './types'
import { createEmptyAnnouncement } from './utils'

export type AnnouncementProviderProps = {
  announcements: Announcement[]
  setAnnouncements: Dispatch<SetStateAction<Announcement[]>>
}

export type AnnouncementValueProps = {
  announcements: Announcement[]
  currentIndex: number
  currentAnnouncement: Announcement
  onChange: (value: Descendant[]) => void
  nextIndex: () => void
  prevIndex: () => void
  insertIndex: () => void
  deleteIndex: () => void
  toggleShow: () => void
}

const AnnouncementContext = createContext<AnnouncementValueProps>(
  {} as AnnouncementValueProps
)

export const useAnnouncement = () => useContext(AnnouncementContext)
export const AnnouncementProvider = (
  props: ProviderProps<AnnouncementProviderProps>
) => {
  const {
    value: { announcements, setAnnouncements },
    children,
  } = props

  const length = announcements.length

  const [index, setIndex] = useState(0)
  const currentAnnouncement = announcements[index]

  const nextIndex = useCallback(() => {
    setIndex((index) => (index + 1) % length)
  }, [length, setIndex])
  const prevIndex = useCallback(() => {
    setIndex((index) => (index + length - 1) % length)
  }, [length, setIndex])
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
  const insertIndex = useCallback(() => {
    setAnnouncements(
      produce((announcements) => {
        announcements.splice(index + 1, 0, createEmptyAnnouncement())
      })
    )
    setIndex(index + 1)
  }, [setAnnouncements, index])
  const deleteIndex = useCallback(() => {
    setAnnouncements(
      produce((announcements) => {
        announcements.splice(index, 1)
      })
    )
  }, [setAnnouncements, index])
  const toggleShow = useCallback(() => {
    setAnnouncements(
      produce((announcements) => {
        announcements[index].show = !announcements[index].show
      })
    )
  }, [setAnnouncements, index])

  const value: AnnouncementValueProps = {
    currentIndex: index,
    announcements,
    currentAnnouncement,
    nextIndex,
    prevIndex,
    onChange,
    insertIndex,
    deleteIndex,
    toggleShow,
  }
  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  )
}
