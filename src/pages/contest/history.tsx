import { Button } from '@chakra-ui/button'
import { Text } from '@chakra-ui/layout'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table'
import { PageContainer } from '@src/components/PageContainer'
import { Title } from '@src/components/Title'
import { useContests } from '@src/utils/api/Contest'
import { toThTimeFormat, toThDate } from '@src/utils/hooks/useTimer'
import NextLink from 'next/link'
import { FaTrophy } from 'react-icons/fa'

export default function ContestHistoryPage() {
  const { data: contests } = useContests()

  return (
    <PageContainer>
      <Title icon={FaTrophy}>ประวัติการแข่งขัน</Title>
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
          {contests?.map((contest) => (
            <Tr key={contest.id} height={16}>
              <Td>{contest.id}</Td>
              <Td>
                <NextLink href={`/contest/history/${contest.id}`}>
                  <Button variant="link" px={1} color="otog">
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
    </PageContainer>
  )
}

export { getServerSideProps } from '@src/utils/api'
