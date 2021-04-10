import { Divider, Flex, Link, Text } from '@chakra-ui/layout'
import { CONTACT_LINK } from '@src/utils/config'
import { PageContainer } from './PageContainer'

export function Footer() {
  return (
    <PageContainer h={14} maxH={14} mt={8}>
      <Divider mb={2} />
      <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between">
        <Text>
          หากมีข้อแนะนำ หรือข้อสงสัย{' '}
          <Link color="otog" href={CONTACT_LINK} target="_blank">
            ติดต่อเรา
          </Link>
        </Text>
        <Text>© 2019 Phakphum Dev Team</Text>
      </Flex>
    </PageContainer>
  )
}
