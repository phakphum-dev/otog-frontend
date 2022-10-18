import { Key, ScopedMutator, State } from 'swr/_internal'

declare module 'swr/_internal' {
  declare type FullConfiguration = InternalConfiguration & PublicConfiguration
  interface InternalConfiguration {
    cache: Cache
    mutate: ScopedMutator
  }
  interface Cache<Data = any> {
    keys(): IterableIterator<string>
    get(key: Key): State<Data> | undefined
    set(key: Key, value: State<Data>): void
    delete(key: Key): void
    clear(): void
  }
}
