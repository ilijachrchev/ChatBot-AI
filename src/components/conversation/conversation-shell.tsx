'use client'
import useSideBar from '@/context/use-sidebar'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

type Props = {
  list: React.ReactNode
  chat: React.ReactNode
}

export function ConversationShell({ list, chat }: Props) {
  const { chatRoom } = useSideBar()
  const [showListMobile, setShowListMobile] = useState(true)

  useEffect(() => {
    if (chatRoom) setShowListMobile(false)
  }, [chatRoom])

  return (
    <div className="flex h-full w-full overflow-hidden">
      <aside
        className={cn(
          'flex-shrink-0 border-r bg-background flex flex-col overflow-y-auto',
          'md:flex md:w-[360px]',
          showListMobile ? 'flex w-full' : 'hidden'
        )}
      >
        {list}
      </aside>

      <div
        className={cn(
          'flex-1 flex flex-col min-h-0',
          !showListMobile ? 'flex' : 'hidden md:flex'
        )}
      >
        {!showListMobile && chatRoom && (
          <button
            onClick={() => setShowListMobile(true)}
            className="md:hidden flex items-center gap-2 px-4 py-3 border-b text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            All conversations
          </button>
        )}
        {chat}
      </div>
    </div>
  )
}
