import { ToggleColorModeButton } from '@src/components/ToggleColorModeButton'
import { withColorMode } from '@src/theme/ColorMode'

function HomePage() {
  return <ToggleColorModeButton />
}

export default withColorMode(HomePage)
export { getServerSideProps } from '@src/theme/ColorMode'
