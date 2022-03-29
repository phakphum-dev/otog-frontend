import Head from 'next/head'
import NextLink from 'next/link'
import { FaTrophy } from 'react-icons/fa'

import { Button } from '@chakra-ui/button'
import { Box, Flex, Text } from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table'

import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { useContests } from '@src/contest/useContest'
import { toThDate, toThTimeFormat } from '@src/utils/time'

export default function ContestHistoryPage() {
  const { data: contests } = useContests()

  return (
    <PageContainer>
      <Head>
        <title>Contest History | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={FaTrophy}>ประวัติการแข่งขัน</Title>
      </TitleLayout>
      {contests ? (
        <Box overflowX="auto">
          <Table>
            <Thead>
              <Tr>
                <Th>#</Th>
                <Th>การแข่งขัน</Th>
                <Th>โหมด</Th>
                <Th>ระยะเวลา</Th>
                <Th>จัดเมื่อ</Th>
              </Tr>
            </Thead>
            <Tbody>
              {contests.map((contest) => (
                <Tr key={contest.id} height={16}>
                  <Td>{contest.id}</Td>
                  <Td>
                    <NextLink href={`/contest/history/${contest.id}`} passHref>
                      <Button as="a" variant="link" px={1} color="otog">
                        {contest.name}
                      </Button>
                    </NextLink>
                  </Td>
                  <Td>
                    <Text casing="capitalize">{contest.mode}</Text>
                  </Td>
                  <Td>
                    {toThTimeFormat(
                      new Date(contest.timeEnd).getTime() -
                        new Date(contest.timeStart).getTime()
                    )}
                  </Td>
                  <Td>{toThDate(contest.timeStart)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      ) : (
        <Flex justify="center" py={16}>
          <Spinner size="xl" />
        </Flex>
      )}
    </PageContainer>
  )
}

export { getServerSideCookies as getServerSideProps } from '@src/context/HttpClient'
