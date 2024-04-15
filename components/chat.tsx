'use client'

import { ChatPanel } from './chat-panel'
import { ChatMessages } from './chat-messages'
import { AI, AIState, AIStateMessage, UIState } from '@/app/action'
import { useAIState, useUIState } from 'ai/rsc'
import { useEffect } from 'react'
import { saveThreadData } from '@/server/prisma/actions'
import { useRouter } from 'next/navigation'
import { useThreadContext } from '@/app/_providers/ThreadContextProvider'
import { nanoid } from 'ai'
import { BotMessage } from './message'
import { UserMessage } from './user-message'
import { Section } from './section'
import { SearchResultsImageSection } from './search-results-image'
import { SearchResults } from './search-results'
import SearchRelated from './search-related'
import { FollowupPanel } from './followup-panel'
import { Copilot } from './copilot'

export const getUIStateFromAIState = (aiState: AIState): UIState => {
  return aiState.messages
    .filter(message => message.role.toLowerCase() !== 'system')
    .map(message => ({
      id: message.id || nanoid(),
      component:
        message.role.toLowerCase() === 'tool' ? (
          message.name === 'images' ? (
            <Section title="Images">
              <SearchResultsImageSection
                images={JSON.parse(message.content).images}
                query={JSON.parse(message.content).query}
              />
            </Section>
          ) : message.name === 'sources' ? (
            <Section title="Sources">
              <SearchResults results={JSON.parse(message.content).results} />
            </Section>
          ) : (
            <p>{message.content} Unregistered component</p>
          )
        ) : message.role.toLowerCase() === 'user' ? (
          message.name === 'copilot' ? (
            <Copilot
              inquiry={undefined}
              savedAnswer={JSON.parse(message.content)}
            />
          ) : (
            <UserMessage name={message.name} message={message.content} />
          )
        ) : message.name === 'answer' ? (
          <Section title="Answer">
            <BotMessage content={message.content} />
          </Section>
        ) : message.name === 'related' ? (
          <Section title="Related" separator={true}>
            <SearchRelated relatedQueries={message.content} />
          </Section>
        ) : message.name === 'inquiry' ? (
          <Copilot inquiry={message.content} savedAnswer={undefined} />
        ) : (
          <p>{message.content} Unregistered component</p>
        )
    }))
}

export function Chat() {
  const router = useRouter()
  const { threadData } = useThreadContext()

  const [aiState, setAiState] = useAIState<typeof AI>()
  const [messages, setMessages] = useUIState<typeof AI>()

  useEffect(() => {
    if (threadData) {
      const messages = JSON.parse(threadData.history) as AIStateMessage[]
      setAiState({ chatId: threadData.id, messages })
      setMessages(
        getUIStateFromAIState({ chatId: String(threadData.id), messages })
      )
    }
  }, [])

  useEffect(() => {
    if (aiState.messages.length > 0) {
      saveThreadData({
        threadId: threadData ? threadData.id : null,
        messages: aiState.messages
      }).then(data => {
        if (!threadData && data) {
          router.push(`/${data.id}`)
        }
      })
    }
  }, [aiState.messages])

  return (
    <div className="w-full px-8 md:px-12 pt-6 md:pt-8 pb-14 md:pb-24 max-w-3xl mx-auto flex flex-col space-y-3 md:space-y-4">
      <ChatMessages messages={messages} />
      {aiState.messages.length > 0 &&
        aiState.messages[aiState.messages.length - 1].role === 'assistant' &&
        aiState.messages[aiState.messages.length - 1].name === 'related' && (
          <Section title="Follow-up">
            <FollowupPanel />
          </Section>
        )}
      <ChatPanel />
    </div>
  )
}
