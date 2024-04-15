'use client'

import Link from 'next/link'
import { MutableRefObject, useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { useRouter } from 'next/navigation'
import { validateTavilyApiKey } from '@/server/third-party/tavily'

export default function TavilyApiKeyInput({
  triggerBtnRef
}: {
  triggerBtnRef: MutableRefObject<HTMLButtonElement | null>
}) {
  const router = useRouter()

  const [tavilyApiKey, setTavilyApiKey] = useState<string>('')
  useEffect(() => {
    const savedTavilyApiKey = localStorage.getItem('tavilyApiKey')
    if (savedTavilyApiKey) {
      setTavilyApiKey(savedTavilyApiKey)
      setKeyInput(savedTavilyApiKey)
    }
  }, [])
  const [keyEditable, setKeyEditable] = useState<boolean>(false)
  const [keyInput, setKeyInput] = useState<string>('')

  const handleInputKey = async () => {
    const isValidKey = await validateTavilyApiKey(keyInput)
    if (!isValidKey) {
      alert('Invalid Tavily API Key.')
      return
    }
    localStorage.setItem('tavilyApiKey', keyInput)
    alert('Tavily API key successfully updated.')
    router.refresh()
    window.location.reload()
  }

  return (
    <Dialog>
      <DialogTrigger ref={triggerBtnRef}>
        <p
          className={`text-sm ${
            tavilyApiKey ? 'text-lime-600' : 'text-red-500'
          }`}
        >
          {tavilyApiKey ? 'Active Tavily API key' : 'Missing Tavily API key'}
        </p>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage your Tavily API key</DialogTitle>
          <DialogDescription>
            <div className="w-full mt-4 flex flex-col gap-2">
              <p className="text-sm">
                To help Mindpedia remain FREE FOREVER, we kindly ask you to use
                your Tavily API Key (for web search) to power your own usage.
              </p>
              <p className="text-sm">
                Your API key is securely stored in your local browser.
              </p>
              {tavilyApiKey ? (
                <div className="flex flex-col gap-4 w-full">
                  <Input
                    disabled={!keyEditable}
                    type={keyEditable ? 'text' : 'password'}
                    placeholder="Enter Your Tavily API Key"
                    value={keyInput}
                    onChange={e => setKeyInput(e.target.value)}
                    className="w-full"
                  />
                  {!keyEditable ? (
                    <div className="flex gap-2">
                      <Button onClick={() => setKeyEditable(true)}>
                        Change key
                      </Button>
                      <Button
                        onClick={() => {
                          const userConfirmation = confirm(
                            'Are you sure you want to delete this key?'
                          )
                          if (!userConfirmation) {
                            return
                          }
                          localStorage.removeItem('tavilyApiKey')
                          alert('Tavily API key successfully deleted.')
                          window.location.reload()
                        }}
                      >
                        Delete key
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        disabled={!keyInput || !keyInput.trim()}
                        onClick={() => void handleInputKey()}
                      >
                        Save
                      </Button>
                      <Button onClick={() => setKeyEditable(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4 w-full">
                  <div className="text-sm w-full flex items-center gap-2">
                    <h3>Don&apos;t have an Tavily API key?</h3>
                    <Link
                      href="https://app.tavily.com"
                      className="text-sm font-bold text-primary hover:text-primary-400"
                      target={'_blank'}
                    >
                      Generate one here
                    </Link>
                  </div>
                  <Input
                    type={'text'}
                    placeholder="Enter a valid Tavily API Key"
                    value={keyInput}
                    onChange={e => setKeyInput(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button
                      disabled={!keyInput || !keyInput.trim()}
                      onClick={() => void handleInputKey()}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
