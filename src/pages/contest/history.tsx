import Head from 'next/head'
import NextLink from 'next/link'
import { FaTrophy } from 'react-icons/fa'

import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { useContests } from '@src/contest/queries'
import { Link } from '@src/ui/Link'
import { Spinner } from '@src/ui/Spinner'
import { Table, Td, Th } from '@src/ui/Table'
import { toThDate, toThTimeFormat } from '@src/utils/time'

export default function ContestHistoryPage() {
  const { data: contests } = useContests()

  return (
    <PageContainer>
      <Head>
        <title>Contest History | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={<FaTrophy />}>ประวัติการแข่งขัน</Title>
      </TitleLayout>
      {contests ? (
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <Th>#</Th>
                <Th>การแข่งขัน</Th>
                <Th>โหมด</Th>
                <Th>ระยะเวลา</Th>
                <Th>จัดเมื่อ</Th>
              </tr>
            </thead>
            <tbody>
              {contests.map((contest) => (
                <tr key={contest.id} className="h-16">
                  <Td>{contest.id}</Td>
                  <Td>
                    <NextLink
                      href={`/contest/history/${contest.id}`}
                      passHref
                      legacyBehavior
                    >
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
                </tr>
              ))}
            </tbody>
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
