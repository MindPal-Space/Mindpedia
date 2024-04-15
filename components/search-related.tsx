'use client'

import React from 'react'
import { Button } from './ui/button'
import { ArrowRight } from 'lucide-react'
import { useActions, useStreamableValue, useUIState } from 'ai/rsc'
import { AI, UIStateItem } from '@/app/action'
import { UserMessage } from './user-message'
import { PartialRelated, Related } from '@/lib/schema/related'
import { useThreadContext } from '@/app/_providers/ThreadContextProvider'

export interface SearchRelatedProps {
  relatedQueries: string | PartialRelated
}

export const SearchRelated: React.FC<SearchRelatedProps> = ({
  relatedQueries
}) => {
  const { openAiApiKeyInputBtnRef, tavilyApiKeyInputBtnRef } =
    useThreadContext()

  const { submit } = useActions<typeof AI>()
  const [, setMessages] = useUIState<typeof AI>()
  const [data, error, pending] = useStreamableValue<PartialRelated>(
    typeof relatedQueries === 'string' ? undefined : relatedQueries
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Control
    const openAiApiKey = localStorage.getItem('openAiApiKey')
    const tavilyApiKey = localStorage.getItem('tavilyApiKey')
    if (!openAiApiKey) {
      alert('Missing OpenAI API Key. Please input one to continue.')
      openAiApiKeyInputBtnRef.current?.click()
      return
    }
    if (!tavilyApiKey) {
      alert('Missing Tavily API Key. Please input one to continue.')
      tavilyApiKeyInputBtnRef.current?.click()
      return
    }
    const formData = new FormData(event.currentTarget as HTMLFormElement)

    // // Get the submitter of the form
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLInputElement
    let query = ''
    if (submitter) {
      formData.append(submitter.name, submitter.value)
      query = submitter.value
    }

    const userMessage = {
      id: Date.now(),
      isGenerating: false,
      component: (
        <UserMessage name={undefined} message={query} isFirstMessage={false} />
      )
    }

    const responseMessage = await submit(openAiApiKey, tavilyApiKey, formData)
    setMessages((currentMessages: UIStateItem[]) => [
      ...currentMessages,
      userMessage,
      responseMessage
    ])
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap">
      {(typeof relatedQueries === 'string'
        ? (JSON.parse(relatedQueries) as Related)
        : data
      )?.items
        ?.filter(item => item?.query !== '')
        .map((item, index) => (
          <div className="flex items-start w-full" key={index}>
            <ArrowRight className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-accent-foreground/50" />
            <Button
              variant="link"
              className="flex-1 justify-start px-0 py-1 h-fit font-semibold text-accent-foreground/50 whitespace-normal text-left"
              type="submit"
              name={'related_query'}
              value={item?.query}
            >
              {item?.query}
            </Button>
          </div>
        ))}
    </form>
  )
}

export default SearchRelated
