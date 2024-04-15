import type { UIStateItem } from '@/app/action'

export function ChatMessages({ messages }: { messages: UIStateItem[] }) {
  return (
    <>
      {messages.map((message: UIStateItem) => (
        <div key={message.id} className="w-full">
          {message.component}
        </div>
      ))}
    </>
  )
}
