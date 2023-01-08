import Head from 'next/head'
import NextLink from 'next/link'
import { FaTrophy } from 'react-icons/fa'

import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table'

import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { useContests } from '@src/contest/queries'
import { Link } from '@src/ui/Link'
import { Spinner } from '@src/ui/Spinner'
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
        <div className="overflow-x-auto">
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
                      <Link className="px-1">{contest.name}</Link>
                    </NextLink>
                  </Td>
                  <Td>
                    <div className="capitalize">{contest.mode}</div>
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
        </div>
      ) : (
        <div className="flex justify-center py-16">
          <Spinner size="xl" />
        </div>
      )}
    </PageContainer>
  )
}

export { getServerSideCookies as getServerSideProps } from '@src/context/HttpClient'
