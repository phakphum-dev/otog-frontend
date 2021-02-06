import { createContext, ProviderProps, useContext } from 'react'

export const InitialDataContext = createContext({} as any)
export const useInitialDataContext = () => useContext(InitialDataContext)

export const InitialDataProvider = (props: ProviderProps<any>) => {
  return <InitialDataContext.Provider {...props} />
}

export function useInitialData() {
  return useInitialDataContext()
}
