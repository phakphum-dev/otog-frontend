import useSWR from 'swr'

import { Announcement } from './types'

import { http } from '@src/context/HttpClient'

export async function getAnnouncements() {
  return http.get<Announcement[]>('announcement')
}

export function useAnnouncements() {
  return useSWR('announcement', getAnnouncements)
}

type PostAnnouncementBody = Pick<Announcement, 'value'>
export function createAnnouncement(body: PostAnnouncementBody) {
  return http.post<Announcement>('announcement', body)
}

export function deleteAnnouncemet(announcementId: number) {
  return http.del<Announcement>(`announcement/${announcementId}`)
}

export function toggleAnnouncemet(announcementId: number, show: boolean) {
  return http.patch<Announcement>(`announcement/${announcementId}`, { show })
}

export function updateAnnouncement(
  announcementId: number,
  announcementData: Announcement
) {
  return http.put<Announcement>(
    `announcement/${announcementId}`,
    announcementData
  )
}
