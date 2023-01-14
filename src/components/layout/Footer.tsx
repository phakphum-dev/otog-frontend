import { PageContainer } from './PageContainer'

import { CONTACT_LINK, GITHUB_LINK, OFFLINE_MODE } from '@src/config'
import { Link } from '@src/ui/Link'

export const Footer = () => (
  <PageContainer className="mt-8 flex-none pb-4">
    <hr className="mb-2" />
    <div className="flex flex-col justify-between sm:flex-row">
      {OFFLINE_MODE ? (
        <span>หากมีข้อสงสัย กรุณายกมือถาม</span>
      ) : (
        <span>
          หากมีข้อแนะนำ หรือข้อสงสัย{' '}
          <Link href={GITHUB_LINK} isExternal>
            ติดต่อเรา
          </Link>
        </span>
      )}
      <span>
        {OFFLINE_MODE ? (
          '© 2022 Phakphum Dev Team'
        ) : (
          <Link variant="hidden" href={CONTACT_LINK} isExternal>
            © 2022 Phakphum Dev Team
          </Link>
        )}
      </span>
    </div>
  </PageContainer>
)
