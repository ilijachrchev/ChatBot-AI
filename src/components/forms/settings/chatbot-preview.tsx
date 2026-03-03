'use client'
import { MessageSquare, Send, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

type ChatbotPreviewProps = {
  icon: string | null | undefined
  welcomeMessage: string | null | undefined
  previewIcon: string | null
  chatbotColor?: string
  chatbotTitle?: string | null
  chatbotSubtitle?: string | null
  userBubbleColor?: string | null
  botBubbleColor?: string | null
  userTextColor?: string | null
  botTextColor?: string | null
  buttonStyle?: string | null
  bubbleStyle?: string | null
  showAvatars?: boolean | null
  widgetSize?: string | null
  widgetStyle?: string | null
  removeBranding?: boolean | null
  chatPosition?: string | null
}

export const ChatbotPreview = ({
  icon,
  welcomeMessage,
  previewIcon,
  chatbotColor = '#3B82F6',
  chatbotTitle,
  chatbotSubtitle,
  userBubbleColor,
  botBubbleColor,
  userTextColor,
  botTextColor,
  buttonStyle,
  bubbleStyle,
  showAvatars,
  widgetSize,
  widgetStyle,
  removeBranding,
  chatPosition,
}: ChatbotPreviewProps) => {
  const displayIcon = previewIcon || icon
  const displayMessage = welcomeMessage || 'Hey there, have a question? Text us here'
  const displayTitle = chatbotTitle || 'Sales Rep - AI'
  const displaySubtitle = chatbotSubtitle || 'SendWise-AI'

  const finalUserBubbleColor = userBubbleColor || chatbotColor || '#3B82F6'
  const finalBotBubbleColor = botBubbleColor || '#F1F5F9'
  const finalUserTextColor = userTextColor || '#FFFFFF'
  const finalBotTextColor = botTextColor || '#1E293B'
  const finalShowAvatars = showAvatars ?? true
  const showPoweredBy = !removeBranding
  const isBottomLeft = chatPosition === 'BOTTOM_LEFT'

  const getButtonClass = () => {
    switch (buttonStyle) {
      case 'SQUARE': return 'rounded-none'
      case 'PILL': return 'rounded-full'
      default: return 'rounded-lg'
    }
  }

  const getBubbleClass = () => {
    switch (bubbleStyle) {
      case 'SQUARE': return 'rounded-none'
      case 'PILL': return 'rounded-full'
      default: return 'rounded-2xl'
    }
  }

  const getSizeClasses = () => {
    switch (widgetSize) {
      case 'COMPACT': return { container: 'max-w-[360px]', chat: 'h-[300px]' }
      case 'FULL': return { container: 'max-w-[480px]', chat: 'h-[440px]' }
      default: return { container: 'max-w-[420px]', chat: 'h-[370px]' }
    }
  }

  const getStyleClasses = () => {
    switch (widgetStyle) {
      case 'SOFT': return 'bg-white/95 backdrop-blur-sm border border-gray-200/50'
      case 'GLASS': return 'bg-white/70 backdrop-blur-md border border-white/30 shadow-2xl'
      default: return 'bg-white border border-gray-200'
    }
  }

  const getContentAreaClass = () => {
    switch (widgetStyle) {
      case 'SOFT': return 'bg-slate-50/80'
      case 'GLASS': return 'bg-white/40 backdrop-blur-sm'
      default: return 'bg-slate-50'
    }
  }

  const getInputAreaClass = () => {
    switch (widgetStyle) {
      case 'SOFT': return 'bg-white/60 border-t border-gray-200/60'
      case 'GLASS': return 'bg-white/20 backdrop-blur-sm border-t border-white/20'
      default: return 'bg-white border-t border-slate-200'
    }
  }

  const getMockBrowserBg = () => {
    switch (widgetStyle) {
      case 'GLASS': return 'bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950'
      case 'SOFT': return 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900'
      default: return 'bg-slate-100 dark:bg-slate-800'
    }
  }

  const sizeClasses = getSizeClasses()

  return (
    <div className={cn('relative w-full mx-auto transition-all duration-300', sizeClasses.container)}>
      <div className="absolute -top-3 right-4 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          Live Preview
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="bg-slate-200 dark:bg-slate-700 px-3 py-2 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <div className="flex-1 mx-3 h-4 rounded bg-slate-300 dark:bg-slate-600 text-[9px] text-slate-500 dark:text-slate-400 flex items-center px-2">
            yourwebsite.com
          </div>
        </div>

        <div className={cn(
          'relative transition-all duration-300 p-3',
          getMockBrowserBg()
        )}>
          <div className={cn(
            'rounded-xl overflow-hidden transition-all duration-300',
            getStyleClasses()
          )}>
            <div
              className="p-4"
              style={{ background: `linear-gradient(135deg, ${chatbotColor} 0%, ${chatbotColor}dd 100%)` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-white flex items-center justify-center">
                      {displayIcon ? (
                        <Image src={displayIcon} alt="Bot" width={40} height={40} className="object-cover" />
                      ) : (
                        <MessageSquare className="h-5 w-5" style={{ color: chatbotColor }} />
                      )}
                    </div>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{displayTitle}</h3>
                    <p className="text-white/90 text-xs">{displaySubtitle}</p>
                  </div>
                </div>

                {finalShowAvatars && (
                  <div className="flex -space-x-2">
                    <div className="h-7 w-7 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">A</div>
                    <div className="h-7 w-7 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">B</div>
                    <div className="h-7 w-7 rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-[10px] font-bold">C</div>
                  </div>
                )}

                <button className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors">
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className={cn(
              'p-4 space-y-4 overflow-y-auto transition-all duration-300',
              sizeClasses.chat,
              getContentAreaClass()
            )}>
              <div className="flex items-start gap-2">
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${chatbotColor} 0%, ${chatbotColor}dd 100%)` }}
                >
                  {displayIcon ? (
                    <Image src={displayIcon} alt="Bot" width={28} height={28} className="rounded-full object-cover" />
                  ) : (
                    <MessageSquare className="h-3.5 w-3.5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className={cn('p-3 shadow-sm border max-w-[240px]', getBubbleClass())}
                    style={{
                      backgroundColor: finalBotBubbleColor,
                      color: finalBotTextColor,
                      borderColor: `${finalBotBubbleColor}20`,
                    }}
                  >
                    <p className="text-xs">{displayMessage}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 ml-2 mt-1 block">Just now</span>
                </div>
              </div>

              <div className="flex items-start gap-2 justify-end">
                <div className="flex-1">
                  <div
                    className={cn('p-3 shadow-sm max-w-[240px] ml-auto', getBubbleClass())}
                    style={{ backgroundColor: finalUserBubbleColor, color: finalUserTextColor }}
                  >
                    <p className="text-xs">I want this</p>
                  </div>
                  <span className="text-[10px] text-slate-500 mr-2 mt-1 block text-right">Just now</span>
                </div>
              </div>
            </div>

            <div className={cn('p-3', getInputAreaClass())}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className={cn(
                    'flex-1 px-3 py-1.5 border border-slate-300 bg-slate-50 text-xs focus:outline-none text-slate-900 placeholder:text-slate-400',
                    getButtonClass()
                  )}
                  disabled
                />
                <button
                  className={cn('h-8 w-8 flex items-center justify-center text-white shadow-md', getButtonClass())}
                  style={{ background: `linear-gradient(135deg, ${chatbotColor} 0%, ${chatbotColor}dd 100%)` }}
                  disabled
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {showPoweredBy && (
              <div className="flex justify-center py-1.5 border-t border-slate-100">
                <p className="text-[10px] text-slate-400">
                  Powered by <span className="font-semibold">SendWise AI</span>
                </p>
              </div>
            )}
          </div>

          <div className={cn(
            'absolute bottom-3 flex items-end',
            isBottomLeft ? 'left-3' : 'right-3'
          )}>
            <div
              className="h-8 w-8 rounded-full shadow-lg flex items-center justify-center"
              style={{ backgroundColor: chatbotColor }}
            >
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -top-3 left-4 z-10 flex gap-2">
        {widgetSize && (
          <div className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold">
            {widgetSize}
          </div>
        )}
        {widgetStyle && (
          <div className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-semibold">
            {widgetStyle}
          </div>
        )}
      </div>
    </div>
  )
}
