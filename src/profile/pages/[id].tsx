import Head from 'next/head'
import { useRouter } from 'next/router'
import { FaTasks, FaUser } from 'react-icons/fa'
import { unstable_serialize } from 'swr'

import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { useAuth } from '@src/context/AuthContext'
import { withCookies } from '@src/context/HttpClient'
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
        <Title icon={FaUser}>{userData!.showName}</Title>
      </TitleLayout>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row gap-8">
          {user?.id === id ? (
            <ProfileUpload />
          ) : (
            <ProfilePicture userId={id} name={userData!.showName} />
          )}
          <Graph userContest={userData!.attendedContest} />
        </div>
        {user?.role === 'admin' && (
          <div className="flex flex-col gap-2">
            <TitleLayout>
              <Title icon={FaTasks}>ผลตรวจ</Title>
            </TitleLayout>
            <ProfileSubmissionTable userId={id} />
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export const getServerSideProps = withCookies(async (context) => {
  const id = Number(context.query.id)
  if (Number.isNaN(id)) {
    return { notFound: true }
  }
  const user = getUser(id)
  return {
    props: {
      fallback: {
        [unstable_serialize(keyUser(id))]: await user,
      },
    },
  }
})
