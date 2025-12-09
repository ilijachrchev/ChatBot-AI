import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

export const Responding = ({ botIcon }: { botIcon?: string | null }) => {
  return (
    <div className="self-start flex items-end gap-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <Avatar className="w-6 h-6 flex-shrink-0 border border-gray-200">
        {botIcon ? (
          <AvatarImage src={botIcon} alt="bot" className="object-cover" />
        ) : (
          <>
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="@shadcn"
            />
            <AvatarFallback className="bg-indigo-100 text-indigo-600 text-[10px]">
              AI
            </AvatarFallback>
          </>
        )}
      </Avatar>
      <div className="bg-gray-100 rounded-xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="chat-bubble">
          <div className="typing">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>
    </div>
  )
}