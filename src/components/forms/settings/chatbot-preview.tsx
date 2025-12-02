'use client'
import React from 'react'
import { MessageSquare, Send, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

type ChatbotPreviewProps = {
  icon: string | null | undefined
  welcomeMessage: string | null | undefined
  previewIcon: string | null
}

export const ChatbotPreview = ({ icon, welcomeMessage, previewIcon }: ChatbotPreviewProps) => {
  const displayIcon = previewIcon || (icon ? `https://ucarecdn.com/${icon}/` : null)
  const displayMessage = welcomeMessage || "Hey there, have a question? Text us here"

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Live Badge */}
      <div className="absolute -top-3 right-4 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          Live Preview
        </div>
      </div>

      {/* Chatbot Widget */}
      <div className="relative rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-white overflow-hidden bg-white flex items-center justify-center">
                  {displayIcon ? (
                    <Image
                      src={displayIcon}
                      alt="Bot"
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <MessageSquare className="h-6 w-6 text-blue-500" />
                  )}
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></span>
              </div>

              {/* Bot Info */}
              <div>
                <h3 className="text-white font-semibold text-sm">
                  Sales Rep - You
                </h3>
                <p className="text-blue-100 text-xs">
                  Web Prodigies
                </p>
              </div>
            </div>

            <button className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors">
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="p-4 space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
          {/* Bot Message */}
          <div className="flex items-start gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              {displayIcon ? (
                <Image
                  src={displayIcon}
                  alt="Bot"
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                <MessageSquare className="h-4 w-4 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm p-3 shadow-sm border border-slate-200 dark:border-slate-700 max-w-[280px]">
                <p className="text-sm text-slate-900 dark:text-white">
                  {displayMessage}
                </p>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 mt-1 block">
                Just now
              </span>
            </div>
          </div>

          {/* Example User Message */}
          <div className="flex items-start gap-2 justify-end">
            <div className="flex-1">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl rounded-tr-sm p-3 shadow-sm max-w-[280px] ml-auto">
                <p className="text-sm text-white">
                  I want this
                </p>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mr-2 mt-1 block text-right">
                Just now
              </span>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400"
              disabled
            />
            <button className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Powered By */}
      <div className="text-center mt-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Powered by <span className="font-semibold">SendWise AI</span>
        </p>
      </div>
    </div>
  )
}