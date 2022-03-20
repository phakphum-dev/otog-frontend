import { Descendant } from 'slate'

import { Announcement } from './types'

export function createDescendant(value: string): Descendant[] {
  return [
    {
      type: 'heading-one',
      children: [{ text: value, bold: true }],
    },
  ]
}

export function createEmptyAnnouncement(): Announcement {
  return {
    id: Math.floor(Math.random() * 10000),
    show: false,
    value: createDescendant(''),
  }
}
