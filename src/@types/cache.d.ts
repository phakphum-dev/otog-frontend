import 'swr/dist/types'

declare module 'swr/dist/types' {
  export interface Cache {
    clear(): void
  }
}
