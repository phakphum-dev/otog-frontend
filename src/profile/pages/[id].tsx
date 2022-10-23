import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FaTasks, FaUser } from 'react-icons/fa'
import { unstable_serialize } from 'swr'

import { Stack } from '@chakra-ui/layout'

import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { useAuth } from '@src/context/AuthContext'
import { getServerSide } from '@src/context/HttpClient'
import { EditableName } from '@src/profile/EditableName'
import { Graph } from '@src/profile/Graph'
import { ProfilePicture, ProfileUpload } from '@src/profile/ProfilePicture'
import { ProfileSubmissionTable } from '@src/submission/SubmissionTable'
import { getUser, keyUser, useUser } from '@src/user/queries'

export default function ProfilePage() {
  const router = useRouter()
  const id = Number(router.query.id)
  const { user } = useAuth()
  const { data: userData } = useUser(id)

  return (
    <PageContainer>
      <Head>
        <title>Profile #{id} | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={FaUser}>
          <EditableName userData={userData!} />
        </Title>
      </TitleLayout>
      <Stack>
        <Stack direction={{ base: 'column', md: 'row' }} spacing={8}>
          {user?.id === id ? <ProfileUpload /> : <ProfilePicture userId={id} />}
          <Graph userContest={userData!.attendedContest} />
        </Stack>
        {user?.role === 'admin' && (
          <Stack>
            <TitleLayout>
              <Title icon={FaTasks}>ผลตรวจ</Title>
            </TitleLayout>
            <ProfileSubmissionTable userId={id} />
          </Stack>
        )}
      </Stack>
    </PageContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = Number(context.query.id)
  if (Number.isNaN(id)) {
    return { notFound: true }
  }
  return getServerSide(context, async () => {
    const user = getUser(id)
    return {
      [unstable_serialize(keyUser(id))]: await user,
    }
  })
}
