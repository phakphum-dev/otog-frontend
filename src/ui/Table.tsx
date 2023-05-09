import { VariantProps, cva } from 'class-variance-authority'
import { ComponentProps, createContext, useContext } from 'react'
import { twMerge } from 'tailwind-merge'

export type TableStyleValue = VariantProps<typeof tableStyles>
export type TableProps = ComponentProps<'table'> & TableStyleValue
const TableContext = createContext<TableStyleValue>({
  variant: 'simple',
  size: 'sm',
})

const tableStyles = cva('w-full', {
  variants: {
    variant: {
      simple: '',
      rounded:
        'border-separate border-spacing-0 rounded-lg bg-white dark:bg-gray-800',
      unstyled: '',
    },
    size: {
      sm: '',
      md: '',
    },
  },
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
      <table
        className={twMerge(tableStyles({ size, variant }), className)}
        {...props}
      >
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
        rounded:
          'border-y border-gray-100 first:rounded-tl-lg first:border-l last:rounded-tr-lg last:border-r dark:border-gray-700',
        unstyled: '',
      },
      size: {
        sm: 'px-4 py-1',
        md: 'px-6 py-4',
      },
    },
    defaultVariants: { textAlign: 'start', variant: 'simple' },
  }
)
export type ThProps = ComponentProps<'th'> & VariantProps<typeof thStyles>
export const Th = ({ className, textAlign, children, ...props }: ThProps) => {
  const styles = useTableContext()
  return (
    <th
      className={twMerge(thStyles({ textAlign, ...styles }), className)}
      {...props}
    >
      {children}
    </th>
  )
}
const tdStyles = cva('', {
  variants: {
    variant: {
      simple: 'border-b border-gray-100 dark:border-gray-700 ',
      rounded:
        'border-b border-gray-100 first:border-l last:border-r dark:border-gray-700',
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
    <td className={twMerge(tdStyles({ ...styles }), className)} {...props}>
      {children}
    </td>
  )
}

const trStyles = cva('', {
  variants: {
    variant: {
      simple: '',
      rounded:
        '[&_td:first-child]:last:rounded-bl-lg [&_td:last-child]:last:rounded-br-lg',
      unstyled: '',
    },
  },
  defaultVariants: { variant: 'simple' },
})
export type TrProps = ComponentProps<'tr'> & VariantProps<typeof trStyles>
export const Tr = ({ className, children, ...props }: TrProps) => {
  const styles = useTableContext()
  return (
    <tr className={twMerge(trStyles({ ...styles }), className)} {...props}>
      {children}
    </tr>
  )
}
