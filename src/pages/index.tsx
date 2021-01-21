import { ToggleColorModeButton } from '@src/components/ToggleColorModeButton'
import { withColorMode } from '@src/theme/ColorMode'

function Home() {
  return <ToggleColorModeButton />
}

export default withColorMode(Home)
export { getServerSideProps } from '@src/theme/ColorMode'
