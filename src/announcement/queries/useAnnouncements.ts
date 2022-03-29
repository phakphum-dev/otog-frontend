import useSWR from 'swr'

import { Announcement } from '../types'

import { HttpClient } from '@src/context/HttpClient'

export function useAnnouncements() {
  return useSWR<Announcement[]>('announcement')
}

type PostAnnouncementBody = Pick<Announcement, 'value'>
export function createAnnouncement(
  client: HttpClient,
  body: PostAnnouncementBody
) {
  return client.post<Announcement>('announcement', body)
}

export function deleteAnnouncemet(client: HttpClient, announcementId: number) {
  return client.del<Announcement>(`announcement/${announcementId}`)
}

export function toggleAnnouncemet(
  client: HttpClient,
  announcementId: number,
  show: boolean
) {
  return client.patch<Announcement>(`announcement/${announcementId}`, { show })
}

export function updateAnnouncement(
  client: HttpClient,
  announcementId: number,
  announcementData: Announcement
) {
  return client.put<Announcement>(
    `announcement/${announcementId}`,
    announcementData
  )
}
