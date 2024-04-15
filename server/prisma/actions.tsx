'use server'

import { AIStateMessage } from '@/app/action'
import { prisma } from '.'
import { indexSeoPage } from '../main/seo-index'

export const saveThreadData = async ({
  threadId,
  messages
}: {
  threadId: string | null
  messages: AIStateMessage[]
}) => {
  if (threadId) {
    return prisma.thread.update({
      where: {
        id: threadId
      },
      data: {
        history: JSON.stringify(messages)
      }
    })
  } else {
    const newThread = await prisma.thread.create({
      data: {
        title: messages[0].content,
        history: JSON.stringify(messages)
      }
    })
    const result = await indexSeoPage(
      `https://search.mindpal.io/${newThread.id}`
    )
    return newThread
  }
}
