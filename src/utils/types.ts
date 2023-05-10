export type PolymorphicProps<DefaultProps, T extends React.ElementType> =
  | ({ as?: never } & DefaultProps)
  | ({ as: T } & React.ComponentPropsWithoutRef<T> &
      Omit<DefaultProps, keyof React.ComponentPropsWithoutRef<T>>)
