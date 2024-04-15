'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useActions, useUIState } from 'ai/rsc'
import type { AI, UIStateItem } from '@/app/action'
import { UserMessage } from './user-message'
import { ArrowRight } from 'lucide-react'
import { useThreadContext } from '@/app/_providers/ThreadContextProvider'

export function FollowupPanel() {
  const { openAiApiKeyInputBtnRef, tavilyApiKeyInputBtnRef } =
    useThreadContext()

  const [input, setInput] = useState('')
  const { submit } = useActions<typeof AI>()
  const [, setMessages] = useUIState<typeof AI>()

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

    const userMessage = {
      id: Date.now(),
      isGenerating: false,
      component: (
        <UserMessage name={undefined} message={input} isFirstMessage={false} />
      )
    }

    const responseMessage = await submit(openAiApiKey, tavilyApiKey, formData)
    setMessages((currentMessages: UIStateItem[]) => [
      ...currentMessages,
      userMessage,
      responseMessage
    ])

    setInput('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center space-x-1"
    >
      <Input
        type="text"
        name="input"
        placeholder="Ask a follow-up question..."
        value={input}
        className="pr-14 h-12"
        onChange={e => setInput(e.target.value)}
      />
      <Button
        type="submit"
        size={'icon'}
        disabled={input.length === 0}
        variant={'ghost'}
        className="absolute right-1"
      >
        <ArrowRight size={20} />
      </Button>
    </form>
  )
}
