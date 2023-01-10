import clsx from 'clsx'
import { VariantProps, cva } from 'cva'
import { ComponentProps, createContext, useContext } from 'react'

export type TableStyleValue = {
  variant: 'simple' | 'unstyled'
  size: 'sm' | 'md'
}
export type TableProps = ComponentProps<'table'> & Partial<TableStyleValue>
const TableContext = createContext<TableStyleValue>({
  variant: 'simple',
  size: 'sm',
})
const useTableContext = () => useContext(TableContext)
export const Table = ({
  variant = 'simple',
  size = 'md',
  className,
  children,
  ...props
}: TableProps) => {
  return (
    <TableContext.Provider value={{ size, variant }}>
      <table className={clsx('w-full', className)} {...props}>
        {children}
      </table>
    </TableContext.Provider>
  )
}
const thStyles = cva(
  'text-gray-600 dark:text-gray-400 text-xs font-bold spacing tracking-wider',
  {
    variants: {
      textAlign: { start: 'text-start', center: 'text-center' },
      variant: {
        simple: 'border-b border-gray-100 dark:border-gray-700 ',
        unstyled: '',
      },
      size: {
        sm: 'px-4 py-1',
        md: 'px-6 py-3',
      },
    },
    defaultVariants: { textAlign: 'start', variant: 'simple' },
  }
)
export type ThProps = ComponentProps<'th'> & VariantProps<typeof thStyles>
export const Th = ({ className, textAlign, children, ...props }: ThProps) => {
  const styles = useTableContext()
  return (
    <th className={thStyles({ textAlign, className, ...styles })} {...props}>
      {children}
    </th>
  )
}
const tdStyles = cva('px-6 py-4', {
  variants: {
    variant: {
      simple: 'border-b border-gray-100 dark:border-gray-700 ',
      unstyled: '',
    },
    size: {
      sm: 'px-4 py-2 leading-4 text-sm',
      md: 'px-6 py-4 leading-5',
    },
  },
  defaultVariants: { variant: 'simple' },
})
export type TdProps = ComponentProps<'td'> & VariantProps<typeof tdStyles>
export const Td = ({ className, children, ...props }: TdProps) => {
  const styles = useTableContext()
  return (
    <td className={tdStyles({ ...styles, className })} {...props}>
      {children}
    </td>
  )
}
