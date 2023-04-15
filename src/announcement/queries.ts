import useSWR from 'swr'

import { Announcement } from './types'

import { api } from '@src/api'

export async function getAnnouncements() {
  return api.get('announcement').json<Announcement[]>()
}

export function useAnnouncements() {
  return useSWR('announcement', getAnnouncements)
}

type PostAnnouncementBody = Pick<Announcement, 'value'>
export function createAnnouncement(body: PostAnnouncementBody) {
  return api.url('announcement').post(body).json<Announcement>()
}

export function deleteAnnouncemet(announcementId: number) {
  return api.url(`announcement/${announcementId}`).delete().json<Announcement>()
}

export function toggleAnnouncemet(announcementId: number, show: boolean) {
  return api
    .url(`announcement/${announcementId}`)
    .patch({ show })
    .json<Announcement>()
}

export function updateAnnouncement(
  announcementId: number,
  announcementData: Announcement
) {
  return api
    .url(`announcement/${announcementId}`)
    .put(announcementData)
    .json<Announcement>()
}
