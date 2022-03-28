import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FaUser } from 'react-icons/fa'

import { Stack } from '@chakra-ui/layout'

import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { useAuth } from '@src/context/AuthContext'
import { getServerSideFetch } from '@src/context/HttpClient'
import { EditableName } from '@src/profile/EditableName'
import { Graph } from '@src/profile/Graph'
import { ProfilePicture, ProfileUpload } from '@src/profile/ProfilePicture'
import { UserProfile } from '@src/user/types'

export interface ProfilePageProps {
  userData: UserProfile
}

export default function ProfilePage(props: ProfilePageProps) {
  const { userData } = props
  const router = useRouter()
  const id = Number(router.query.id)
  const { user } = useAuth()
  return (
    <PageContainer>
      <Head>
        <title>Profile #{id} | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={FaUser}>
          <EditableName userData={userData} />
        </Title>
      </TitleLayout>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={8}>
        {user?.id === Number(id) ? (
          <ProfileUpload />
        ) : (
          <ProfilePicture userId={id} />
        )}
        <Graph userContest={userData.attendedContest} />
      </Stack>
    </PageContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = Number(context.query.id)
  if (Number.isNaN(id)) {
    return { notFound: true }
  }
  return getServerSideFetch<ProfilePageProps>(context, async (client) => ({
    userData: await client.get<UserProfile>(`user/${id}/profile`),
  }))
}
