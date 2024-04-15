import { cn } from '@/lib/utils'
import React from 'react'

type UserMessageProps = {
  name: string | null | undefined
  message: string
  isFirstMessage?: boolean
}

export const UserMessage: React.FC<UserMessageProps> = ({
  name,
  message,
  isFirstMessage
}) => {
  return (
    <div className={cn({ 'pt-4': !isFirstMessage })}>
      <div className="text-xl">
        {name === 'input'
          ? (JSON.parse(message) as { input: string }).input
          : message}
      </div>
    </div>
  )
}
