import { AI } from '@/app/action'
import { ThreadContextProvider } from '@/app/_providers/ThreadContextProvider'
import { Chat } from '@/components/chat'
import { Header } from '@/components/header'
import { prisma } from '@/server/prisma'
import { nanoid } from 'ai'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const metadata = await prisma.thread.findUnique({
    where: {
      id: params.id
    },
    select: {
      title: true
    }
  })
  return {
    title: metadata?.title.includes(`{"input":`)
      ? (JSON.parse(metadata.title) as { input: string }).input
      : metadata?.title || 'Mindpedia'
  }
}

export default async function SavedThreadPage({ params }: Props) {
  const threadData = await prisma.thread.findUnique({
    where: {
      id: params.id
    }
  })

  if (!threadData) {
    redirect('/')
  }

  return (
    <ThreadContextProvider threadData={threadData}>
      <div className="w-full flex flex-col min-h-screen">
        <Header />
        <main className="w-full flex flex-col flex-1 dark:bg-background">
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
