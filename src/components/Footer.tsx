import { Container, Divider, Flex, Link, Spacer, Text } from '@chakra-ui/layout'
import { useTheme } from '@chakra-ui/system'

import { CONTACT_LINK, GITHUB_LINK } from '@src/utils/config'

export const Footer = () => {
  const theme = useTheme()
  const maxWidth = theme.sizes.container

  return (
    <Container maxWidth={maxWidth} mt={8} pb={4}>
      <Divider mb={2} />
      <Flex direction={{ base: 'column', sm: 'row' }}>
        <Text>
          หากมีข้อแนะนำ หรือข้อสงสัย{' '}
          <Link href={CONTACT_LINK} isExternal>
            ติดต่อเรา
          </Link>
        </Text>
        <Spacer />
        <Text>
          ©{' '}
          <Link variant="hidden" href={GITHUB_LINK} isExternal>
            2021 Phakphum Dev Team
          </Link>
        </Text>
      </Flex>
    </Container>
  )
}
