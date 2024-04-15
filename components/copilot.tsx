'use client'

import React, { useEffect, useState } from 'react'
import { Inquiry, PartialInquiry } from '@/lib/schema/inquiry'
import { Input } from './ui/input'
import { Checkbox } from './ui/checkbox'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { ArrowRight, Check, FastForward, Sparkles } from 'lucide-react'
import { useActions, useAIState, useStreamableValue, useUIState } from 'ai/rsc'
import { AI, AIState, UIStateItem } from '@/app/action'
import { useThreadContext } from '@/app/_providers/ThreadContextProvider'

export type CopilotProps = {
  inquiry?: string | PartialInquiry
  savedAnswer?: { [key: string]: any }
}

export const Copilot: React.FC<CopilotProps> = ({
  inquiry,
  savedAnswer
}: CopilotProps) => {
  const { openAiApiKeyInputBtnRef, tavilyApiKeyInputBtnRef } =
    useThreadContext()

  const [completed, setCompleted] = useState(savedAnswer ? true : false)
  const [query, setQuery] = useState(
    savedAnswer && savedAnswer.additional_query
      ? savedAnswer.additional_query
      : ''
  )
  const [skipped, setSkipped] = useState(false)
  const [data, error, pending] = useStreamableValue<PartialInquiry>(
    typeof inquiry === 'string' ? undefined : inquiry
  )
  const [checkedOptions, setCheckedOptions] = useState<{
    [key: string]: boolean
  }>(
    savedAnswer
      ? Object.keys(savedAnswer)
          .filter(key => key !== 'additional_query')
          .reduce((obj, key) => {
            ;(obj as { [key: string]: boolean })[key] = savedAnswer[key]
            return obj
          }, {})
      : {}
  )
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)
  const [_, setMessages] = useUIState<typeof AI>()
  const [aiState, setAiState] = useAIState<typeof AI>()
  const { submit } = useActions<typeof AI>()

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    checkIfButtonShouldBeEnabled()
  }

  const handleOptionChange = (selectedOption: string) => {
    const updatedCheckedOptions = {
      ...checkedOptions,
      [selectedOption]: !checkedOptions[selectedOption]
    }
    setCheckedOptions(updatedCheckedOptions)
    checkIfButtonShouldBeEnabled(updatedCheckedOptions)
  }

  const checkIfButtonShouldBeEnabled = (currentOptions = checkedOptions) => {
    const anyCheckboxChecked = Object.values(currentOptions).some(
      checked => checked
    )
    setIsButtonDisabled(!(anyCheckboxChecked || query))
  }

  const updatedQuery = () => {
    const selectedOptions = Object.entries(checkedOptions)
      .filter(([, checked]) => checked)
      .map(([option]) => option)
    return [...selectedOptions, query].filter(Boolean).join(', ')
  }

  useEffect(() => {
    checkIfButtonShouldBeEnabled()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const onFormSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    skip?: boolean
  ) => {
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

    setCompleted(true)
    setSkipped(skip || false)

    const formData = skip
      ? undefined
      : new FormData(e.target as HTMLFormElement)

    const responseMessage = await submit(
      openAiApiKey,
      tavilyApiKey,
      formData,
      skip
    )
    const msgIdsToDelete = (aiState as AIState).messages
      .filter(
        m =>
          m.role === 'assistant' &&
          m.name === 'inquiry' &&
          typeof m.id !== 'undefined'
      )
      .map(msg => msg.id)
    setAiState({
      ...aiState,
      messages: (aiState as AIState).messages.filter(
        m => !msgIdsToDelete.includes(m.id)
      )
    } as AIState)
    setMessages((currentMessages: UIStateItem[]) => [
      ...currentMessages.filter(m => !msgIdsToDelete.includes(m.id)),
      responseMessage
    ])
  }

  const handleSkip = (e: React.MouseEvent<HTMLButtonElement>) => {
    onFormSubmit(e as unknown as React.FormEvent<HTMLFormElement>, true)
  }

  if (error) {
    return (
      <Card className="p-4 w-full flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4" />
          <h5 className="text-muted-foreground text-xs truncate">
            {`error: ${error}`}
          </h5>
        </div>
      </Card>
    )
  }

  if (skipped) {
    return null
  }

  if (completed) {
    return (
      <Card className="p-3 md:p-4 w-full flex justify-between items-center">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <h5 className="text-muted-foreground text-xs truncate">
            {updatedQuery()}
          </h5>
        </div>
        <Check size={16} className="text-green-500 w-4 h-4" />
      </Card>
    )
  } else {
    return (
      <Card className="p-4 rounded-lg w-full mx-auto">
        <div className="flex items-center mb-4">
          <p className="text-lg text-foreground text-semibold">
            {
              (typeof inquiry === 'string'
                ? (JSON.parse(inquiry) as Inquiry)
                : data
              )?.question
            }
          </p>
        </div>
        <form onSubmit={onFormSubmit}>
          <div className="flex flex-wrap justify-start mb-4">
            {(typeof inquiry === 'string'
              ? (JSON.parse(inquiry) as Inquiry)
              : data
            )?.options?.map((option, index) => (
              <div
                key={`option-${index}`}
                className="flex items-center space-x-1.5 mb-2"
              >
                <Checkbox
                  id={option?.value}
                  name={option?.value}
                  onCheckedChange={() =>
                    handleOptionChange(option?.label as string)
                  }
                />
                <label
                  className="text-sm whitespace-nowrap pr-4"
                  htmlFor={option?.value}
                >
                  {option?.label}
                </label>
              </div>
            ))}
          </div>
          {(typeof inquiry === 'string'
            ? (JSON.parse(inquiry) as Inquiry)
            : data
          )?.allowsInput && (
            <div className="mb-6 flex flex-col space-y-2 text-sm">
              <label className="text-muted-foreground" htmlFor="query">
                {
                  (typeof inquiry === 'string'
                    ? (JSON.parse(inquiry) as Inquiry)
                    : data
                  )?.inputLabel
                }
              </label>
              <Input
                type="text"
                name="additional_query"
                className="w-full"
                id="query"
                placeholder={
                  (typeof inquiry === 'string'
                    ? (JSON.parse(inquiry) as Inquiry)
                    : data
                  )?.inputPlaceholder
                }
                value={query}
                onChange={handleInputChange}
              />
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={pending}
            >
              <FastForward size={16} className="mr-1" />
              Skip
            </Button>
            <Button type="submit" disabled={isButtonDisabled || pending}>
              <ArrowRight size={16} className="mr-1" />
              Send
            </Button>
          </div>
        </form>
      </Card>
    )
  }
}
