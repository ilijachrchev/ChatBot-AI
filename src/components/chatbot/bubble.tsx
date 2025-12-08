import { cn, getMonthName } from '@/lib/utils'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Link, User } from 'lucide-react'

type Props = {
    message: {
        role: 'assistant' | 'user'
        content: string
        link?: string
    }
    createdAt?: Date
    botIcon?: string
    userBubbleColor?: string | null
    botBubbleColor?: string | null
    userTextColor?: string | null
    botTextColor?: string | null
    buttonStyle?: string | null
    bubbleStyle?: string | null
}

const Bubble = ({  message, 
    createdAt, 
    botIcon,
    userBubbleColor,
    botBubbleColor,
    userTextColor,
    botTextColor,
    buttonStyle,
    bubbleStyle,
  }: Props) => {
    let d = new Date()

    const isImageUrl = message.content.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
                        message.content.includes('/uploads/')

    const getBubbleClass = () => {
      switch (bubbleStyle) {
        case 'SQUARE':
          return 'rounded-none'
        case 'PILL':
          return 'rounded-full'
        case 'ROUNDED':
        default:
          return 'rounded-lg'
      }
    }

    const finalUserBubbleColor = userBubbleColor || '#3B82F6'
    const finalBotBubbleColor = botBubbleColor || '#F1F5F9'
    const finalUserTextColor = userTextColor || '#FFFFFF'
    const finalBotTextColor = botTextColor || '#1E293B'

   return (
    <div className={cn(
      'flex gap-2 items-end',
      message.role == 'assistant' ? 'self-start' : 'self-end flex-row-reverse'
    )}>
      {message.role == 'assistant' ? (
        <Avatar className='w-5 h-5'>
          {botIcon ? (
            <AvatarImage src={botIcon} alt="bot" />
          ) : (
            <>
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt='@shadcn'
              />
              <AvatarFallback>CN</AvatarFallback>
            </>
          )}
        </Avatar>
      ) : (
        <Avatar className="w-5 h-5">
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
      )}
        <div className={cn(
            'flex flex-col gap-3 min-w-[85%] p-4 break-words',
            getBubbleClass(),
            message.role == 'assistant'
                ? 'rounded-tl-sm'
                : 'rounded-tr-sm'
        )}
          style={{
            backgroundColor: message.role === 'assistant' 
            ? finalBotBubbleColor 
            : finalUserBubbleColor,
          color: message.role === 'assistant'
            ? finalBotTextColor
            : finalUserTextColor,
          }}
        >
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
            {isImageUrl ? (
                <div className='relative w-full h-[250px] rounded-md overflow-hidden bg-gray-100'>
                    <img 
                        src={message.content}
                        alt="Uploaded Image"
                        className='w-full h-full object-contain'
                    />
                </div>
            ) : (
                <p className='text-sm break-words whitespace-pre-wrap'>
                    {message.content.replace('(complete)', '')}
                    {message.link && (
                        <Link
                            className="underline font-bold pl-2 hover:opacity-80"
                            href={message.link}
                            target='_blank'
                            style={{ 
                                color: message.role === 'assistant' 
                                    ? finalBotTextColor 
                                    : finalUserTextColor 
                            }}
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