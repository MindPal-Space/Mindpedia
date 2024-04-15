import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const exampleMessages = [
  {
    heading: 'What are the benefits of intermittent fasting?',
    message: 'What are the benefits of intermittent fasting?'
  },
  {
    heading: 'How to start investing in cryptocurrency?',
    message: 'How to start investing in cryptocurrency?'
  },
  {
    heading: 'Best home workout routines for beginners',
    message: 'Best home workout routines for beginners'
  },
  {
    heading: 'Latest fashion trends for summer 2024',
    message: 'Latest fashion trends for summer 2024'
  },
  {
    heading: 'Benefits of mindfulness meditation',
    message: 'Benefits of mindfulness meditation'
  },
  {
    heading: 'Guide to sustainable gardening practices',
    message: 'Guide to sustainable gardening practices'
  }
]

export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  return (
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-2">
        <div className="flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              name={message.message}
              onClick={async () => {
                submitMessage(message.message)
              }}
            >
              <ArrowRight size={16} className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
