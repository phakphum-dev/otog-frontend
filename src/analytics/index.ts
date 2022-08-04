import { AnalyticsBrowser } from '@segment/analytics-next'

import { SEGMENT_API_KEY } from '@src/config'

export const analytics = AnalyticsBrowser.load({ writeKey: SEGMENT_API_KEY })
