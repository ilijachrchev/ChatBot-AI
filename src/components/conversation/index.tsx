"use client"
import { useConversation } from '@/hooks/conversation/use-conversation'
import React from 'react'
import TabsMenu from '../tabs/intex'
import { TABS_MENU } from '@/constants/menu'
import { TabsContent } from '@radix-ui/react-tabs'
import ConversationSearch from './search'
import { Loader } from '../loader'
import { CardDescription } from '../ui/card'
import ChatCard from './chat-card'
import { Separator } from '../ui/separator'

type Props = {
    domains?: 
    | {
        name: string
        id: string
        icon: string
    } []
    | undefined
}
const EXPIRATION_DAYS = 14
const STARRED_IDS = new Set<string>([

])

const ConversationMenu = ({ domains }: Props) => {
  const { register, chatRooms, loading, onGetActiveChatMessages } = useConversation()
  const getLatest = (row: any) => row?.chatRoom?.[0]?.message?.[0]
  const getRoomId = (row: any) => row?.chatRoom?.[0]?.id as string | undefined

  const isUnread = (row: any) => {
    const last = getLatest(row)
    return !!last && !last.seen
  }

  const isExpired = (row: any) => {
    const last = getLatest(row)
    if (!last?.createdAt) return false
    const lastDate = new Date(last.createdAt)
    const diffMs = Date.now() - lastDate.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 *24)
    return diffDays >= EXPIRATION_DAYS
  }

  const isStarred = (row: any) => {
    const id = getRoomId(row)
    return !!id && STARRED_IDS.has(id)
  }

  const sortByLatestDesc = (rows: any[]) => [...rows].sort((a, b) => {
    const aTime = new Date(getLatest(a)?.createdAt ?? 0).getTime();
    const bTime = new Date(getLatest(b)?.createdAt ?? 0).getTime();
    return bTime-aTime;
  })

  const renderList = (rows: any[], emptyText: string) => (
    <div className="flex flex-col">
      <Loader loading={loading}>
        {rows?.length ? (
          rows.map((row, idx) => {
            const room0 = row.chatRoom?.[0];
            if (!room0) return null;

            const msg0 = room0.message?.[0];

            return (
              <ChatCard
                key={room0.id ?? `chat-${idx}`}
                id={room0.id}
                onChat={() => onGetActiveChatMessages(room0.id)}
                seen={!!msg0?.seen}
                createdAt={msg0?.createdAt ?? room0.createdAt}
                title={row.email ?? ''}
                description={msg0?.message ?? ''}
              />
            );
          })
        ) : (
          <CardDescription>{emptyText}</CardDescription>
        )}
      </Loader>
    </div>
  )

  return (
    <div className='py-3 px-0'>
      <TabsMenu triggers={TABS_MENU}>
        <TabsContent value='unread'>
          <ConversationSearch 
            domains={domains}
            register={register}
          />
            {renderList(sortByLatestDesc((chatRooms || []).filter(isUnread)), 'No unread chats')}
        </TabsContent>


        <TabsContent value='all'>
          <Separator 
            orientation='horizontal'
            className='mt-5'
          />
          {renderList(sortByLatestDesc(chatRooms || []), 'No chats for your domain')}
        </TabsContent>


        <TabsContent value='expired'>
          <Separator 
            orientation='horizontal'
            className='mt-5'
          />
          {renderList(sortByLatestDesc((chatRooms || []).filter(isExpired)), 'No expired threads')}
        </TabsContent>


        <TabsContent value='starred'>
          <Separator 
            orientation='horizontal'
            className='mt-5'
          />
          {renderList(sortByLatestDesc((chatRooms || []).filter(isStarred)), 'No starred chats')}
        </TabsContent>
        
      </TabsMenu>
    </div>
  )
}

export default ConversationMenu