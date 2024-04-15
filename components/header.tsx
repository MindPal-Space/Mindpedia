'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ModeToggle } from './mode-toggle'
import OpenAiApiKeyInput from './settings/OpenAiApiKeyInput'
import { useThreadContext } from '@/app/_providers/ThreadContextProvider'
import TavilyApiKeyInput from './settings/TavilyApiKeyInput'
import { ExternalLink } from './ui/external-link'

export function Header() {
  const { openAiApiKeyInputBtnRef, tavilyApiKeyInputBtnRef } =
    useThreadContext()

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full px-4 border-b h-14 shrink-0 bg-background backdrop-blur-xl">
      <span className="inline-flex items-center gap-x-3 home-links whitespace-nowrap">
        <a
          href="/"
          rel="noopener"
          target="_blank"
          className="rounded-full overflow-hidden"
        >
          <Image
            src={'/logo.png'}
            alt="Mindpedia Logo"
            width={100}
            height={100}
            className="h-6 w-auto aspect-auto"
          />
        </a>
        <Link href="/">
          <span className="text-lg font-semibold">Mindpedia</span>
        </Link>
      </span>
      <div className="flex flex-row items-center justify-end gap-x-4">
        <OpenAiApiKeyInput triggerBtnRef={openAiApiKeyInputBtnRef} />
        <TavilyApiKeyInput triggerBtnRef={tavilyApiKeyInputBtnRef} />
        <ExternalLink href="https://mindpal.io/">MindPal</ExternalLink>
        <ExternalLink href="https://everlearns.com/">EverLearns</ExternalLink>
        <ExternalLink href="https://everlynai.com/">Everlyn AI</ExternalLink>
        <ModeToggle />
      </div>
    </header>
  )
}
