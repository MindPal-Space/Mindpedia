'use client'

import { StreamableValue, useStreamableValue } from 'ai/rsc'
import { MemoizedReactMarkdown } from './ui/markdown'

export function BotMessage({
  content
}: {
  content: string | StreamableValue<string>
}) {
  const [data, error, pending] = useStreamableValue(
    typeof content === 'string' ? undefined : content
  )

  if (typeof content === 'string') {
    return (
      <MemoizedReactMarkdown className="max-w-none prose prose-sm">
        {content}
      </MemoizedReactMarkdown>
    )
  }

  // Currently, sometimes error occurs after finishing the stream.
  if (error) return <div>Error</div>

  return (
    <MemoizedReactMarkdown className="max-w-none prose prose-sm">
      {data}
    </MemoizedReactMarkdown>
  )
}
