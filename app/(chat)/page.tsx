import { Chat } from '@/components/chat'
import { Header } from '@/components/header'
import { nanoid } from 'ai'
import { AI } from '../action'
import { ThreadContextProvider } from '../_providers/ThreadContextProvider'

export default async function Page() {
  return (
    <ThreadContextProvider threadData={null}>
      <div className="w-full flex flex-col min-h-screen">
        <Header />
        <main className="w-full flex flex-col flex-1dark:bg-background">
          <AI
            initialAIState={{ chatId: nanoid(), messages: [] }}
            initialUIState={[]}
          >
            <Chat />
          </AI>
        </main>
      </div>
    </ThreadContextProvider>
  )
}
