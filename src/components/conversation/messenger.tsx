"use client"
import { useChatWindow } from '@/hooks/conversation/use-conversation'
import React, { useState, useEffect } from 'react'
import { Loader } from '../loader'
import Bubble from '../chatbot/bubble'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { MessageSquare, Paperclip, Star, X } from 'lucide-react'
import {
  onToggleRealtime,
  onGetConversationMode,
  onUpdateChatRoomStatus,
  onToggleStarredChatRoom,
  onGetChatRoomInfo,
} from '@/actions/conversation'
import { cn } from '@/lib/utils'

type RoomInfo = {
  email: string | null
  domainName: string
  createdAt: Date
  starred: boolean
  status: string
}

type RoomStatus = 'OPEN' | 'PENDING' | 'RESOLVED'

const STATUS_OPTIONS: RoomStatus[] = ['OPEN', 'PENDING', 'RESOLVED']

const STATUS_COLORS: Record<RoomStatus, string> = {
  OPEN: 'text-[var(--success)]',
  PENDING: 'text-[var(--warning)]',
  RESOLVED: 'text-[var(--text-muted)]',
}

type Props = Record<string, never>

const Messenger = (_props: Props) => {
  const { messageWindowRef, chats, loading, chatRoom, onHandleSentMessage, register } =
    useChatWindow()

  const [isRealtime, setIsRealtime] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    const checkMode = async () => {
      if (chatRoom) {
        const mode = await onGetConversationMode(chatRoom)
        if (mode) setIsRealtime(mode.live)
      }
    }
    checkMode()
  }, [chatRoom])

  useEffect(() => {
    const fetchInfo = async () => {
      if (!chatRoom) {
        setRoomInfo(null)
        return
      }
      const info = await onGetChatRoomInfo(chatRoom)
      if (info) {
        setRoomInfo({
          email: info.Customer?.email ?? null,
          domainName: info.Domain?.name ?? '',
          createdAt: info.createdAt,
          starred: info.starred,
          status: info.status,
        })
      }
    }
    fetchInfo()
  }, [chatRoom])

  const handleToggleRealtime = async () => {
    if (!chatRoom) return
    setToggling(true)
    const newState = !isRealtime
    const result = await onToggleRealtime(chatRoom, newState)
    if (result) setIsRealtime(newState)
    setToggling(false)
  }

  const handleStatusChange = async (newStatus: RoomStatus) => {
    if (!chatRoom) return
    setRoomInfo((prev) => (prev ? { ...prev, status: newStatus } : prev))
    await onUpdateChatRoomStatus(chatRoom, newStatus)

    if (newStatus === 'RESOLVED' && isRealtime) {
      await onToggleRealtime(chatRoom, false)
      setIsRealtime(false)
    }
  }

  const handleToggleStar = async () => {
    if (!chatRoom || !roomInfo) return
    const newStarred = !roomInfo.starred
    setRoomInfo((prev) => (prev ? { ...prev, starred: newStarred } : prev))
    await onToggleStarredChatRoom(chatRoom, newStarred)
  }

  const contentProps = register('content')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      const form = e.currentTarget.closest('form')
      if (form) form.requestSubmit()
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    await onHandleSentMessage(e)
    setCharCount(0)
  }

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  if (!chatRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
        <MessageSquare className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-muted-foreground text-sm">Select a conversation to start messaging</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-0 relative">
      {roomInfo && (
        <div className="flex items-center justify-between gap-4 px-5 py-2 border-b bg-[var(--bg-surface)] text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-medium text-foreground">{roomInfo.email ?? 'Anonymous'}</span>
            <span>·</span>
            <span>{roomInfo.domainName}</span>
            <span>·</span>
            <span>{formatDate(roomInfo.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={roomInfo.status}
              onChange={(e) => handleStatusChange(e.target.value as RoomStatus)}
              className={cn(
                'text-xs font-medium border rounded px-2 py-0.5 bg-background cursor-pointer',
                'focus:outline-none focus:ring-1 focus:ring-ring',
                STATUS_COLORS[roomInfo.status as RoomStatus] ?? ''
              )}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleToggleStar}
              className="p-1 rounded hover:bg-[var(--primary-light)] transition-colors"
            >
              <Star
                className={cn(
                  'h-3.5 w-3.5',
                  roomInfo.starred ? 'fill-amber-400 text-[var(--warning)]' : 'text-muted-foreground'
                )}
              />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-surface)]">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-3 h-3 rounded-full',
              isRealtime
                ? 'bg-[var(--success)] animate-pulse shadow-lg shadow-[var(--success)]/50'
                : 'bg-[var(--text-secondary)]'
            )}
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {isRealtime ? 'Real-Time Mode' : 'AI Bot Mode'}
            </span>
            <span className="text-xs text-muted-foreground">
              {isRealtime ? 'You are chatting with customer' : 'Bot is handling responses'}
            </span>
          </div>
        </div>

        <Button
          size="sm"
          type="button"
          onClick={handleToggleRealtime}
          disabled={toggling}
          className={cn(
            'shrink-0 font-medium px-4 py-2 rounded-md border',
            isRealtime
              ? 'bg-[var(--danger)] text-white hover:bg-[var(--danger)]'
              : 'bg-[var(--success)] text-white hover:bg-[var(--success)]'
          )}
        >
          {toggling ? (
            'Switching...'
          ) : isRealtime ? (
            <>
              <X className="w-4 h-4 mr-2" />
              End Real-Time
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 mr-2" />
              Take Over
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 h-0 w-full flex flex-col">
        <Loader loading={loading}>
          <div
            ref={messageWindowRef}
            className="w-full flex-1 h-0 flex flex-col gap-3 px-5 py-5 overflow-y-auto"
          >
            {chats.length ? (
              chats.map((chat, index) => (
                <Bubble
                  key={`${chat.id}-${index}`}
                  message={{ role: chat.role!, content: chat.message }}
                  createdAt={chat.createdAt}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">No messages yet</p>
              </div>
            )}
          </div>
        </Loader>
      </div>

      <form
        onSubmit={handleFormSubmit}
        className="flex px-3 pt-3 pb-4 flex-col backdrop-blur-sm bg-[var(--bg-surface)] w-full gap-2"
      >
        <div className="flex justify-between">
          <Input
            {...contentProps}
            onChange={(e) => {
              contentProps.onChange(e)
              setCharCount(e.target.value.length)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Ctrl+Enter to send)"
            className="focus-visible:ring-0 flex-1 p-0 focus-visible:ring-offset-0 bg-[var(--bg-surface)] rounded-none outline-none border-none"
          />
          <Button type="submit" className="mt-3 px-7" disabled={!chatRoom}>
            Send
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <Paperclip className="text-muted-foreground h-4 w-4" />
          <div className="flex items-center gap-2">
            {charCount > 100 && (
              <span className="text-xs text-muted-foreground">{charCount} chars</span>
            )}
            {!isRealtime && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('RESOLVED')}
                className="text-xs h-7 px-3 text-[var(--success)] border-[var(--success)] hover:bg-[var(--success)] hover:text-[var(--success)]"
              >
                Mark resolved ✓
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default Messenger
