import useSWR from 'swr'

import { Announcement } from '../components/types'

import { ApiClient } from '@src/api'

export function useAnnouncements() {
  return useSWR<Announcement[]>('announcement')
}

type PostAnnouncementBody = Pick<Announcement, 'value'>
export function createAnnouncement(
  client: ApiClient,
  body: PostAnnouncementBody
) {
  return client.post<Announcement>('announcement', body)
}

export function deleteAnnouncemet(client: ApiClient, announcementId: number) {
  return client.del(`announcement/${announcementId}`)
}

export function toggleAnnouncemet(
  client: ApiClient,
  announcementId: number,
  show: boolean
) {
  return client.patch<Announcement>(`announcement/${announcementId}`, { show })
}

export function updateAnnouncement(
  client: ApiClient,
  announcementId: number,
  announcementData: Announcement
) {
  return client.put<Announcement>(
    `announcement/${announcementId}`,
    announcementData
  )
}
