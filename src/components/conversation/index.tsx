"use client"
import { useConversation } from '@/hooks/conversation/use-conversation'
import React, { useState, useCallback } from 'react'
import TabsMenu from '../tabs/intex'
import { TABS_MENU } from '@/constants/menu'
import { TabsContent } from '@radix-ui/react-tabs'
import ConversationSearch from './search'
import { Loader } from '../loader'
import { CardDescription } from '../ui/card'
import ChatCard from './chat-card'
import { Separator } from '../ui/separator'
import { WifiOff } from 'lucide-react'
import Link from 'next/link'
import { onToggleStarredChatRoom } from '@/actions/conversation'
import { Input } from '../ui/input'

type Props = {
  domains?: { name: string; id: string; icon: string }[] | undefined
}

type ChatRoomEntry = {
  id: string
  createdAt: Date
  starred: boolean
  status: string
  message: { message: string; createdAt: Date; seen: boolean }[]
}

type ChatRoomRow = {
  chatRoom: ChatRoomEntry[]
  email: string | null
}

const EXPIRATION_DAYS = 4

const ConversationMenu = ({ domains }: Props) => {
  const { register, chatRooms, setChatRooms, loading, realtimeDisabled, onGetActiveChatMessages } =
    useConversation()
  const [searchQuery, setSearchQuery] = useState('')

  const getLatest = (row: ChatRoomRow) => row?.chatRoom?.[0]?.message?.[0]

  const isUnread = (row: ChatRoomRow) => {
    const last = getLatest(row)
    return !!last && !last.seen
  }

  const isExpired = (row: ChatRoomRow) => {
    const last = getLatest(row)
    let lastActivityDate: Date
    if (last?.createdAt) {
      lastActivityDate = new Date(last.createdAt)
    } else if (row.chatRoom?.[0]?.createdAt) {
      lastActivityDate = new Date(row.chatRoom[0].createdAt)
    } else {
      return false
    }
    const diffMs = Date.now() - lastActivityDate.getTime()
    return diffMs / (1000 * 60 * 60 * 24) >= EXPIRATION_DAYS
  }

  const sortByLatestDesc = (rows: ChatRoomRow[]) =>
    [...rows].sort((a, b) => {
      const aTime = new Date(getLatest(a)?.createdAt ?? 0).getTime()
      const bTime = new Date(getLatest(b)?.createdAt ?? 0).getTime()
      return bTime - aTime
    })

  const applySearch = (rows: ChatRoomRow[]) => {
    if (!searchQuery.trim()) return rows
    const q = searchQuery.toLowerCase()
    return rows.filter(
      (row) =>
        row.email?.toLowerCase().includes(q) ||
        getLatest(row)?.message?.toLowerCase().includes(q)
    )
  }

  const handleStar = useCallback(
    async (roomId: string, starred: boolean) => {
      setChatRooms((prev) =>
        prev.map((row) => ({
          ...row,
          chatRoom: row.chatRoom.map((room) =>
            room.id === roomId ? { ...room, starred } : room
          ),
        }))
      )
      await onToggleStarredChatRoom(roomId, starred)
    },
    [setChatRooms]
  )

  const renderList = (
    rows: ChatRoomRow[],
    emptyText: string,
    roomFilter?: (room: ChatRoomEntry) => boolean
  ) => {
    const filtered = applySearch(rows)
    const allRooms = filtered.flatMap((row) => {
      const rooms = (row.chatRoom ?? []).filter((room) => !roomFilter || roomFilter(room))
      return rooms.map((room0) => ({ row, room0 }))
    })

    return (
      <div className="flex flex-col">
        <Loader loading={loading}>
          {allRooms.length ? (
            allRooms.map(({ row, room0 }) => {
              const msg0 = room0.message?.[0]
              return (
                <ChatCard
                  key={room0.id}
                  id={room0.id}
                  onChat={() => onGetActiveChatMessages(room0.id)}
                  seen={!!msg0?.seen}
                  createdAt={msg0?.createdAt ?? room0.createdAt}
                  title={row.email ?? ''}
                  description={msg0?.message ?? ''}
                  starred={room0.starred}
                  status={room0.status}
                  onStar={handleStar}
                />
              )
            })
          ) : (
            <CardDescription className="px-4 py-3 text-sm">{emptyText}</CardDescription>
          )}
        </Loader>
      </div>
    )
  }

  if (realtimeDisabled) {
    return (
      <div className="flex flex-col py-4 px-0">
        <div className="px-4">
          <ConversationSearch domains={domains} register={register} />
        </div>
        <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
          <div className="rounded-full bg-[var(--bg-card)] p-4">
            <WifiOff className="h-8 w-8 text-[var(--text-muted)]" />
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            Realtime mode is disabled for this domain.
          </p>
          <p className="text-xs text-[var(--text-muted)] max-w-[220px]">
            Enable it in{' '}
            <Link
              href="/settings"
              className="underline underline-offset-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Domain Settings → Realtime &amp; Handoff
            </Link>
          </p>
        </div>
      </div>
    )
  }

  const totalRooms = (chatRooms || []).reduce(
    (acc, row) => acc + (row.chatRoom?.length ?? 0),
    0
  )

  return (
    <div className="flex flex-col py-4 px-0">
      <div className="px-4 mb-2">
        <ConversationSearch domains={domains} register={register} />
        {chatRooms.length > 0 && (
          <Input
            className="mt-2 h-8 text-xs"
            placeholder="Search by email or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
        {totalRooms > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            {totalRooms} conversation{totalRooms !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <TabsMenu triggers={TABS_MENU}>
        <TabsContent value="unread">
          <Separator orientation="horizontal" className="mb-1" />
          {renderList(
            sortByLatestDesc((chatRooms || []).filter(isUnread)),
            'No unread chats'
          )}
        </TabsContent>

        <TabsContent value="all">
          <Separator orientation="horizontal" className="mb-1" />
          {renderList(
            sortByLatestDesc(chatRooms || []).filter((row) => !isExpired(row)),
            'No chats available'
          )}
        </TabsContent>

        <TabsContent value="expired">
          <Separator orientation="horizontal" className="mb-1" />
          {renderList(
            sortByLatestDesc((chatRooms || []).filter(isExpired)),
            'No expired threads'
          )}
        </TabsContent>

        <TabsContent value="starred">
          <Separator orientation="horizontal" className="mb-1" />
          {renderList(
            sortByLatestDesc(chatRooms || []),
            'No starred chats',
            (room) => room.starred
          )}
        </TabsContent>

        <TabsContent value="resolved">
          <Separator orientation="horizontal" className="mb-1" />
          {renderList(
            sortByLatestDesc(chatRooms || []),
            'No resolved conversations',
            (room) => room.status === 'RESOLVED'
          )}
        </TabsContent>
      </TabsMenu>
    </div>
  )
}

export default ConversationMenu
