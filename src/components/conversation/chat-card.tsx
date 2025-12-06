import { useChatTime } from '@/hooks/conversation/use-conversation'
import React from 'react'
import { Card, CardContent, CardDescription } from '../ui/card'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { User } from 'lucide-react'
import { UrgentIcon } from '@/icons/urgent-icon'

type Props = {
    title: string
    description?: string
    createdAt: Date
    id: string
    onChat(): void
    seen?: boolean
}

const ChatCard = ({
    title,
    description,
    createdAt,
    onChat,
    id,
    seen,
 }: Props) => {
    const { messageSentAt, urgent } = useChatTime(createdAt, id)
  return (
    <Card
        onClick={onChat}
        className='rounded-none border-r-0 hover:bg-muted cursor-pointer transition duration-150 ease-in-out'
    >
        <CardContent className='py-4 flex gap-3 px-3'>
            <div className='flex-shrink-0'>
                <Avatar className='w-10 h-10'>
                    <AvatarFallback className='bg-muted'>
                        <User className='w-5 h-5' />
                    </AvatarFallback>
                </Avatar>
            </div>

            <div className='flex-1 min-w-0 flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                    <CardDescription className='font-bold leading-none text-gray-600 dark:text-gray-300 truncate'>
                        {title}
                    </CardDescription>
                    {urgent && !seen && (
                        <div className='flex-shrink-0'>
                            <UrgentIcon />
                        </div>
                    )}
                </div>

                <CardDescription className='text-sm text-gray-500 dark:text-gray-400 truncate'>
                    {description
                        ? description.substring(0, 35) + (description.length > 35 ? '...' : '')
                        : 'This chatroom is empty' 
                    }
                </CardDescription>
            </div>

            <div className='flex-shrink-0 w-[60px] flex items-start justify-end'>
                <CardDescription className='text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap'>
                    {createdAt ? messageSentAt : ''}
                </CardDescription>
            </div>
        </CardContent>
    </Card>
  )
}

export default ChatCard