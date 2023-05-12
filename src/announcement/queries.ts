import useSWR from 'swr'

import { Announcement } from './types'

import { client } from '@src/api'

export async function getAnnouncements() {
  return client.get('announcement').json<Announcement[]>()
}

export function useAnnouncements() {
  return useSWR('announcement', getAnnouncements)
}

type PostAnnouncementBody = Pick<Announcement, 'value'>
export function createAnnouncement(body: PostAnnouncementBody) {
  return client.url('announcement').post(body).json<Announcement>()
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
