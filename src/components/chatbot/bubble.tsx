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

const Bubble = ({  
    message, 
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
          return 'rounded-2xl'
        case 'ROUNDED':
        default:
          return 'rounded-xl'
      }
    }

    const finalUserBubbleColor = userBubbleColor || '#6366F1'
    const finalBotBubbleColor = botBubbleColor || '#F3F4F6'
    const finalUserTextColor = userTextColor || '#FFFFFF'
    const finalBotTextColor = botTextColor || '#1F2937'

   return (
    <div className={cn(
      'flex gap-2 items-end animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
      message.role == 'assistant' ? 'self-start' : 'self-end flex-row-reverse'
    )}>
      {message.role == 'assistant' ? (
        <Avatar className='w-6 h-6 flex-shrink-0 border border-gray-200'>
          {botIcon ? (
            <AvatarImage src={botIcon} alt="bot" className="object-cover" />
          ) : (
            <>
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt='@shadcn'
              />
              <AvatarFallback className="bg-indigo-100 text-indigo-600 text-[10px]">
                AI
              </AvatarFallback>
            </>
          )}
        </Avatar>
      ) : (
        <Avatar className="w-6 h-6 flex-shrink-0 border border-gray-200">
          <AvatarFallback className="bg-gray-100">
            <User className="w-3 h-3 text-gray-600" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
          'flex flex-col gap-2 max-w-[75%] px-3 py-2.5 break-words shadow-sm',
          getBubbleClass(),
          message.role == 'assistant'
              ? 'rounded-bl-sm'
              : 'rounded-br-sm'
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
              <div className='flex gap-1.5 text-[10px] opacity-60'>
                  <p>
                      {createdAt.getDate()} {getMonthName(createdAt.getMonth())}
                  </p>
                  <p>
                      {createdAt.getHours()}:{createdAt.getMinutes().toString().padStart(2, '0')}
                  </p>
              </div>
          ) : (
              <p className='text-[10px] opacity-60'>
                  {`${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`}
              </p>
          )}

          {isImageUrl ? (
              <div className='relative w-full max-w-[200px] h-[180px] rounded-lg overflow-hidden bg-gray-100 border border-gray-200'>
                  <img 
                      src={message.content}
                      alt="Uploaded Image"
                      className='w-full h-full object-cover'
                  />
              </div>
          ) : (
              <p className='text-sm leading-relaxed break-words whitespace-pre-wrap'>
                  {message.content.replace('(complete)', '')}
                  {message.link && (
                      <Link
                          className="inline-flex items-center gap-1 underline font-medium ml-1 hover:opacity-80 transition-opacity"
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