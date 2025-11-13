import { cn, extractUUIDFromString, getMonthName } from '@/lib/utils'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Link, User } from 'lucide-react'
import Image from 'next/image'

type Props = {
    message: {
        role: 'assistant' | 'user'
        content: string
        link?: string
    }
    createdAt?: Date
}

const Bubble = ({ message, createdAt }: Props) => {
    let d = new Date()
    const image = extractUUIDFromString(message.content)
  return (
    <div className={cn(
        'flex gap-2 items-end',
        message.role == 'assistant' ? 'self-start' : 'self-end flex-row-reverse'
    )}>
        {message.role == 'assistant' ? (
            <Avatar className='w-5 h-5'>
                <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt='@shadcn'
                />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
        ) : (
            <Avatar className="w-5 h-5">
                <AvatarFallback>
                    <User />
                </AvatarFallback>
            </Avatar>
        )}
        <div className={cn(
            'flex flex-col gap-3 min-w-[300px] p-4 rounded-t-md',
            message.role == 'assistant'
                ? 'bg-muted rounded-r-md'
                : 'bg-grandis rounded-l-md'
        )}>
            {createdAt ? (
                <div className='flex gap-2 text-xs text-gray-600'>
                    <p>
                        {createdAt.getDate()} {getMonthName(createdAt.getMonth())}
                    </p>
                    <p>
                        {createdAt.getHours()}:{createdAt.getMinutes().toString().padStart(2, '0')}
                        {createdAt.getHours() >= 12 ? 'PM' : 'AM'}
                    </p>
                </div>
            ) : (
                <p className='text-xs'>
                    {`${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')} ${d.getHours() >= 12 ? 'pm' : 'am'}`}
                </p>
            )}
            {image && image[0] ? (
                <div className='relative w-full h-[250px] rounded-md overflow-hidden bg-gray-100'>
                    <Image 
                        src={`https://ucarecdn.com/${image[0]}/`}
                        alt="uploaded image"
                        fill
                        className='object-contain'
                        sizes="(max-width: 400px) 100vw, 400px"
                    />
                </div>
            ) : (
                <p className='text-sm break-words whitespace-pre-wrap'>
                    {message.content.replace('(complete)', '')}
                    {message.link && (
                        <Link
                            className="underline font-bold pl-2 text-blue-500 hover:text-blue-700"
                            href={message.link}
                            target='_blank'
                        >
                            Your Link
                        </Link>
                    )}
                </p>
            )}
        </div>
    </div>
  )
}

export default Bubble