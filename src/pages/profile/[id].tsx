import Head from 'next/head'
import { useRouter } from 'next/router'
import { FaTasks, FaUser } from 'react-icons/fa'
import { unstable_serialize } from 'swr'

import { getAvatarUrl } from '../../profile/useAvartar'

import { withSession } from '@src/api/withSession'
import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { useUserData } from '@src/context/UserContext'
import { FullAvatar, FullAvatarUpload } from '@src/profile/FullAvatar'
import { Graph } from '@src/profile/Graph'
import { ProfileSubmissionTable } from '@src/submission/SubmissionTable'
import { getUser, keyUser, useUser } from '@src/user/queries'

export default function ProfilePage() {
  const router = useRouter()
  const id = Number(router.query.id)
  const { user, isAdmin } = useUserData()
  const { data: userData } = useUser(id)

  return (
    <PageContainer>
      <Head>
        <title>Profile #{id} | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={<FaUser />}>
          {userData!.showName + (isAdmin ? ` (${userData!.username})` : ``)}
        </Title>
      </TitleLayout>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-8 md:flex-row">
          {user?.id === id ? (
            <FullAvatarUpload />
          ) : (
            <FullAvatar userId={id} name={userData!.showName} />
          )}
          <Graph userContest={userData!.attendedContest} />
        </div>
        {user?.role === 'admin' && (
          <div className="flex flex-col gap-2">
            <TitleLayout>
              <Title icon={<FaTasks />}>ผลตรวจ</Title>
            </TitleLayout>
            <ProfileSubmissionTable userId={id} />
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export const getServerSideProps = withSession(async (_, context) => {
  const id = Number(context.query.id)
  if (Number.isNaN(id)) {
    return { notFound: true }
  }
  const user = getUser(id)
  try {
    const profileUrl = getAvatarUrl({ userId: id, small: false })
    return {
      props: {
        fallback: {
          [unstable_serialize(keyUser(id))]: await user,
          [unstable_serialize({ userId: id, small: false })]: await profileUrl,
        },
      },
    }
  } catch {
    return {
      props: {
        fallback: {
          [unstable_serialize(keyUser(id))]: await user,
        },
      },
    }
  }
})
