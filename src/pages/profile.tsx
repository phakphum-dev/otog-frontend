import { PageContainer } from '@src/components/PageContainer'
import { ToggleColorModeButton } from '@src/components/ToggleColorModeButton'

export default function ProfilePage() {
  return (
    <PageContainer>
      <ToggleColorModeButton />
    </PageContainer>
  )
}

export { getServerSideProps } from '@src/utils/api'
