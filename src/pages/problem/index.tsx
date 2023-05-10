import clsx from 'clsx'
import Head from 'next/head'
import {
  Dispatch,
  ForwardedRef,
  SetStateAction,
  forwardRef,
  useState,
} from 'react'

import { AnnouncementCarousel } from '@src/announcement/components/AnnouncementCarousel'
import { getAnnouncements } from '@src/announcement/queries'
import { withSession } from '@src/api/withSession'
import { PageContainer } from '@src/components/layout/PageContainer'
import { useUserData } from '@src/context/UserContext'
import { ProblemTable } from '@src/problem/ProblemTable'
import { useProblems } from '@src/problem/queries'

import { Button, ButtonProps } from '@src/ui/Button'
import { Filter, filters, filterNames } from '@src/problem/filters'

export default function ProblemPage() {
  const { isAuthenticated } = useUserData()
  const [filter, setFilter] = useState<Filter>('total')
  return (
    <PageContainer maxSize="md">
      <Head>
        <title>Problem | OTOG</title>
      </Head>
      <AnnouncementCarousel defaultShow={true} />
      {isAuthenticated && <Buttons setFilter={setFilter} />}
      <ProblemTable filterName={filter} />
    </PageContainer>
  )
}

export interface ButtonsProps {
  setFilter: Dispatch<SetStateAction<Filter>>
}

export const Buttons = (props: ButtonsProps) => {
  const { setFilter } = props
  const { data: problems, isLoading } = useProblems()
  return (
    <div className="mb-8 flex flex-wrap justify-center gap-2 md:gap-3">
      {filterNames.map((filterName) => {
        const { label, filter, colorScheme } = filters[filterName]
        return (
          <OtogButton
            key={label}
            label={label}
            isLoading={isLoading}
            colorScheme={colorScheme}
            onClick={() => setFilter(filterName)}
            number={problems?.filter(filter).length}
          />
        )
      })}
    </div>
  )
}

type OtogButtonProps = ButtonProps & {
  label: string
  isLoading: boolean
  number?: number
}

const OtogButton = forwardRef(
  (
    { label, number, colorScheme, isLoading, ...props }: OtogButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      <Button
        className={clsx(
          'aspect-5/4 h-auto flex-col rounded-lg py-2 max-sm:w-28 sm:h-full sm:flex-1 sm:gap-2',
          isLoading && 'animate-pulse'
        )}
        colorScheme={isLoading ? 'gray' : colorScheme}
        {...props}
        ref={ref}
      >
        <h6>{!isLoading && label}</h6>
        <h3 className="text-3xl font-bold md:text-4xl">{number}</h3>
      </Button>
    )
  }
)

export const getServerSideProps = withSession(async () => {
  const announcement = await getAnnouncements()
  return {
    props: {
      fallback: {
        announcement: await announcement,
      },
    },
  }
})
