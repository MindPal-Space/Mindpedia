'use server'

import {
  StreamableValue,
  createAI,
  createStreamableUI,
  createStreamableValue,
  getMutableAIState
} from 'ai/rsc'
import { ExperimentalMessage, nanoid } from 'ai'
import { Spinner } from '@/components/ui/spinner'
import { inquire, researcher, taskManager, querySuggestor } from '@/lib/agents'
import { Related } from '@/lib/schema/related'

async function submit(
  openAiApiKey: string,
  tavilyApiKey: string,
  formData?: FormData,
  skip?: boolean
) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()
  const uiStream = createStreamableUI()
  const isGenerating = createStreamableValue(true)

  const messages = (aiState.get() as AIState).messages
  // Get the user input from the form data
  const inputType =
    formData && !!formData.get('input') ? 'input' : skip ? 'action' : 'copilot'
  const userInput = skip
    ? `{"action": "skip"}`
    : (formData?.get('input') as string)
  const content = skip
    ? userInput
    : formData
    ? JSON.stringify(Object.fromEntries(formData))
    : null
  // Add the user message to the state
  if (content) {
    const message = { role: 'user', name: inputType, content }
    messages.push(message as AIStateMessage)
    aiState.update({
      ...aiState.get(),
      messages: [...(aiState.get() as AIState).messages, message]
    })
  }

  async function processEvents() {
    uiStream.update(<Spinner />)

    let action: any = { object: { next: 'proceed' } }
    // If the user skips the task, we proceed to the search
    if (!skip)
      action = await taskManager(
        openAiApiKey,
        messages as ExperimentalMessage[]
      )

    if (action.object.next === 'inquire') {
      // Generate inquiry
      const inquiry = await inquire(
        openAiApiKey,
        uiStream,
        messages as ExperimentalMessage[]
      )

      uiStream.done()
      isGenerating.done()
      aiState.done({
        ...aiState.get(),
        messages: [
          ...(aiState.get() as AIState).messages,
          {
            role: 'assistant',
            name: 'inquiry',
            content: JSON.stringify(inquiry)
          }
        ]
      })
      return
    }

    //  Generate the answer
    let answer = ''
    let errorOccurred = false
    const streamText = createStreamableValue<string>()
    while (answer.length === 0) {
      // Search the web and generate the answer
      const { fullResponse, hasError } = await researcher(
        openAiApiKey,
        tavilyApiKey,
        aiState,
        uiStream,
        streamText,
        messages as ExperimentalMessage[]
      )
      answer = fullResponse
      errorOccurred = hasError
    }
    streamText.done()
    aiState.update({
      ...aiState.get(),
      messages: [
        ...(aiState.get() as AIState).messages,
        { role: 'assistant', name: 'answer', content: answer }
      ]
    })

    if (!errorOccurred) {
      // Generate related queries
      const result = await querySuggestor(
        openAiApiKey,
        uiStream,
        messages as ExperimentalMessage[]
      )
      aiState.update({
        ...aiState.get(),
        messages: [
          ...(aiState.get() as AIState).messages,
          {
            role: 'assistant',
            name: 'related',
            content: JSON.stringify((result as { curr: Related }).curr)
          }
        ]
      })
    }

    isGenerating.done(false)
    uiStream.done()
    aiState.done(aiState.get())
  }

  processEvents()

  return {
    id: Date.now(),
    isGenerating: isGenerating.value,
    component: uiStream.value
  }
}

export interface AIStateMessage {
  role: 'user' | 'assistant' | 'system' | 'function' | 'tool'
  content: string
  id?: string
  name?: string
}
export type AIState = {
  chatId: string
  messages: AIStateMessage[]
}

// The initial UI state that the client will keep track of, which contains the message IDs and their UI nodes.
export interface UIStateItem {
  id: string
  isGenerating?: StreamableValue<boolean>
  component: React.ReactNode
}
export type UIState = UIStateItem[]

// AI is a provider you wrap your application with so you can access AI and UI state in your components.
export const AI: any = createAI<AIState, UIState>({
  actions: {
    submit
  },
  // Each state can be any shape of object, but for chat applications
  // it makes sense to have an array of messages. Or you may prefer something like { id: number, messages: Message[] }
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] }
})
