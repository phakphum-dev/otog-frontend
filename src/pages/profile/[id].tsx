import { Stack } from '@chakra-ui/layout'
import { PageContainer } from '@src/components/PageContainer'
import { Title, TitleLayout } from '@src/components/Title'
import { FaUser } from 'react-icons/fa'

import { getServerSideFetch } from '@src/utils/api'
import { GetServerSideProps } from 'next'

import { Graph } from '@src/components/Graph'
import { ProfilePicture, ProfileUpload } from '@src/components/ProfilePicture'
import { UserProfile } from '@src/utils/api/User'
import { useRouter } from 'next/router'
import { useAuth } from '@src/utils/api/AuthProvider'
import Head from 'next/head'
import { EditableName } from '@src/components/EditableName'

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
  return getServerSideFetch<ProfilePageProps>(context, async (api) => ({
    userData: await api.get<UserProfile>(`user/${id}/profile`),
  }))
}
