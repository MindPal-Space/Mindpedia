import { useEffect, useState, useRef } from 'react'
import type { AI, UIStateItem } from '@/app/action'
import { useUIState, useActions, useAIState } from 'ai/rsc'
import { UserMessage } from './user-message'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { ArrowRight, Plus } from 'lucide-react'
import { EmptyScreen } from './empty-screen'
import { nanoid } from 'ai'
import { useThreadContext } from '@/app/_providers/ThreadContextProvider'
import { ExternalLink } from './ui/external-link'

export function ChatPanel() {
  const { openAiApiKeyInputBtnRef, tavilyApiKeyInputBtnRef } =
    useThreadContext()

  const [input, setInput] = useState('')
  const [messages, setMessages] = useUIState<typeof AI>()
  const [_, setAiMessages] = useAIState<typeof AI>()
  const { submit } = useActions<typeof AI>()
  const [isButtonPressed, setIsButtonPressed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  // Focus on input when button is pressed
  useEffect(() => {
    if (isButtonPressed) {
      inputRef.current?.focus()
      setIsButtonPressed(false)
    }
  }, [isButtonPressed])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

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

    // Clear messages if button is pressed
    if (isButtonPressed) {
      handleClear()
      setIsButtonPressed(false)
    }

    // Add user message to UI state
    setMessages((currentMessages: UIStateItem[]) => [
      ...currentMessages,
      {
        id: Date.now(),
        isGenerating: false,
        component: <UserMessage name={undefined} message={input} />
      }
    ])

    // Submit and get response message
    const formData = new FormData(e.currentTarget)
    const responseMessage = await submit(openAiApiKey, tavilyApiKey, formData)
    setMessages((currentMessages: UIStateItem[]) => [
      ...currentMessages,
      responseMessage as any
    ])

    setInput('')
  }

  // Clear messages
  const handleClear = () => {
    setIsButtonPressed(true)
    setMessages([])
    setAiMessages({ chatId: nanoid(), messages: [] })
  }

  useEffect(() => {
    // focus on input when the page loads
    inputRef.current?.focus()
  }, [])

  // If there are messages and the new button has not been pressed, display the new Button
  if (messages.length > 0 && !isButtonPressed) {
    return (
      <div className="fixed bottom-2 md:bottom-8 left-0 right-0 flex justify-center items-center mx-auto">
        <Button
          type="button"
          variant={'secondary'}
          className="rounded-full bg-secondary/80 group transition-all hover:scale-105"
          onClick={() => handleClear()}
        >
          <span className="text-sm mr-2 group-hover:block hidden animate-in fade-in duration-300">
            New
          </span>
          <Plus size={18} className="group-hover:rotate-90 transition-all" />
        </Button>
      </div>
    )
  }

  // Condition 1 and 3: If there are no messages or the button is pressed, display the form
  const formPositionClass =
    messages.length === 0
      ? 'fixed bottom-8 left-0 right-0 top-10 mx-auto h-screen flex flex-col items-center justify-center'
      : 'fixed bottom-8-ml-6'
  return (
    <div className={formPositionClass}>
      {/* <IconKuroko className="w-6 h-6 mb-4" /> */}
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl w-full px-6 flex flex-col items-center gap-8"
      >
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl md:text-5xl text-center font-semibold tracking-tight">
            Ask Mindpedia anything
          </h1>
          <div className="text-sm flex flex-row items-center justify-end gap-x-3">
            <p className="text-zinc-400">Brought to you by</p>
            <ExternalLink href="https://mindpal.io/">MindPal</ExternalLink>
            <ExternalLink href="https://everlearns.com/">
              EverLearns
            </ExternalLink>
            <ExternalLink href="https://everlynai.com/">
              Everlyn AI
            </ExternalLink>
          </div>
        </div>
        <div className="relative flex items-center w-full">
          <Input
            ref={inputRef}
            type="text"
            name="input"
            placeholder="Ask a question..."
            value={input}
            className="pl-4 pr-10 h-12 rounded-full bg-muted"
            onChange={e => {
              setInput(e.target.value)
            }}
          />
          <Button
            type="submit"
            size={'icon'}
            variant={'ghost'}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            disabled={input.length === 0}
          >
            <ArrowRight size={20} />
          </Button>
        </div>
        <EmptyScreen
          submitMessage={message => {
            setInput(message)
          }}
        />
      </form>
    </div>
  )
}
