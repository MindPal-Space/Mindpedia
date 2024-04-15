'use client'

import { Thread } from '@prisma/client'
import {
  createContext,
  MutableRefObject,
  ReactNode,
  useContext,
  useMemo,
  useRef
} from 'react'

interface ThreadContextProps {
  threadData: Thread | null
  openAiApiKeyInputBtnRef: MutableRefObject<HTMLButtonElement | null>
  tavilyApiKeyInputBtnRef: MutableRefObject<HTMLButtonElement | null>
}

const ThreadContext = createContext<ThreadContextProps | undefined>(undefined)

export const useThreadContext = () => {
  const context = useContext(ThreadContext)
  if (!context) {
    throw new Error(
      'useThreadContext must be used within a ThreadContextProvider'
    )
  }
  return context
}

interface ThreadContextProviderProps {
  threadData: Thread | null
  children: ReactNode
}

export const ThreadContextProvider = ({
  threadData,
  children
}: ThreadContextProviderProps) => {
  const openAiApiKeyInputBtnRef = useRef<HTMLButtonElement | null>(null)
  const tavilyApiKeyInputBtnRef = useRef<HTMLButtonElement | null>(null)

  const contextValue = useMemo(
    () => ({
      threadData,
      openAiApiKeyInputBtnRef,
      tavilyApiKeyInputBtnRef
    }),
    [threadData, openAiApiKeyInputBtnRef, tavilyApiKeyInputBtnRef]
  )

  return (
    <ThreadContext.Provider value={contextValue}>
      {children}
    </ThreadContext.Provider>
  )
}
