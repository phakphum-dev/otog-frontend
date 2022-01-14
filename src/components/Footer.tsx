import { PageContainer } from './PageContainer'

import { Divider, Flex, Link, Spacer, Text } from '@chakra-ui/layout'

import { CONTACT_LINK, GITHUB_LINK } from '@src/utils/config'

export const Footer = () => (
  <PageContainer mt={8} pb={4} flex={undefined}>
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
  </PageContainer>
)
