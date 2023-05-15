import useSWR from 'swr'

import { Announcement } from './types'

import { client } from '@src/api'
import { useAnnouncementContext } from './components/AnnouncementProvier'

export function keyAnnouncement(contestId?: number) {
  return contestId ? `announcement/contest/${contestId}` : 'announcement'
}

export async function getAnnouncements(contestId?: number) {
  const url = contestId ? `announcement/contest/${contestId}` : 'announcement'
  return client.get(url).json<Announcement[]>()
}

export function useAnnouncements() {
  const { contestId } = useAnnouncementContext()
  return useSWR(keyAnnouncement(contestId), () => getAnnouncements(contestId))
}

type PostAnnouncementBody = Pick<Announcement, 'value'>
export function createAnnouncement(
  body: PostAnnouncementBody,
  contestId?: number
) {
  const url = contestId ? `announcement/contest/${contestId}` : 'announcement'
  return client.url(url).post(body).json<Announcement>()
}

export function deleteAnnouncemet(announcementId: number) {
  return client
    .url(`announcement/${announcementId}`)
    .delete()
    .json<Announcement>()
}

export function toggleAnnouncement(announcementId: number, show: boolean) {
  return client
    .url(`announcement/${announcementId}`)
    .patch({ show })
    .json<Announcement>()
}

export function updateAnnouncement(
  announcementId: number,
  announcementData: Announcement
) {
  return client
    .url(`announcement/${announcementId}`)
    .put(announcementData)
    .json<Announcement>()
}
