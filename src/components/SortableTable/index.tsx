import clsx from 'clsx'
import { PropsWithChildren, useState } from 'react'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'

import { TableColumnHeaderProps, Text, Th } from '@chakra-ui/react'

import { Link } from '@src/ui/Link'

export type SortingOrder = 'desc' | 'asc'

export const useSortedTable = (
  initialSortName: string,
  initialOrder: SortingOrder
) => {
  const [sortFuncName, setSortFuncName] = useState(initialSortName)
  const [sortOrder, setSortOrder] = useState<SortingOrder>(initialOrder)
  const setSortFunction = (sortName: string, defaultOrder?: SortingOrder) => {
    if (sortFuncName === sortName) {
      if (sortOrder === 'desc') {
        setSortOrder('asc')
      } else {
        setSortOrder('desc')
      }
    } else if (defaultOrder) {
      setSortOrder(defaultOrder)
    }
    setSortFuncName(sortName)
  }
  return { sortFuncName, sortOrder, setSortFunction }
}

type TableHeadProps = PropsWithChildren<
  TableColumnHeaderProps &
    ReturnType<typeof useSortedTable> & {
      sortBy: string
      defaultOrder?: SortingOrder
      centered?: boolean
    }
>
export const SortTh = (props: TableHeadProps) => {
  const {
    setSortFunction,
    sortFuncName,
    sortOrder,
    sortBy,
    defaultOrder = 'desc',
    centered = false,
    children,
    ...rest
  } = props
  return (
    <Th {...rest}>
      <Link
        variant="head"
        onClick={() => setSortFunction(sortBy, defaultOrder)}
      >
        <div
          className={clsx(
            'flex gap-2 items-center',
            centered && 'justify-center'
          )}
        >
          <Text>{children}</Text>
          {sortFuncName === sortBy &&
            (sortOrder === 'desc' ? <FaArrowDown /> : <FaArrowUp />)}
        </div>
      </Link>
    </Th>
  )
}
