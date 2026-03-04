"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChatBotMessageSchema, ChatBotMessageProps } from '@/schemas/conversation.schema'
import { onGetAllAccountDomains } from '@/actions/settings'
import { onGetCurrentChatBot, onAiChatBotAssistant } from '@/actions/bot'
import { BotWindow } from '@/components/chatbot/window'
import InfoBar from '@/components/infobar'
import { FlaskConical, Info, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type Domain = { id: string; name: string; icon: string }
type ChatBotConfig = NonNullable<Awaited<ReturnType<typeof onGetCurrentChatBot>>>
type Chat = { role: 'assistant' | 'user'; content: string; link?: string }

function generateUUID(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

const PlaygroundPage = () => {
  const [domains, setDomains] = useState<Domain[]>([])
  const [selectedDomainId, setSelectedDomainId] = useState<string>('')
  const [chatbotConfig, setChatbotConfig] = useState<ChatBotConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [responding, setResponding] = useState(false)
  const [chatroomId, setChatroomId] = useState<string>('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [messageCount, setMessageCount] = useState(0)
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)

  const messageWindowRef = useRef<HTMLDivElement | null>(null)

  const { register, handleSubmit, reset, setValue } = useForm<ChatBotMessageProps>({
    resolver: zodResolver(ChatBotMessageSchema as Parameters<typeof zodResolver>[0]),
  })

  useEffect(() => {
    setChatroomId(generateUUID())
    const fetchDomains = async () => {
      const result = await onGetAllAccountDomains()
      if (result?.domains?.length) {
        setDomains(result.domains as Domain[])
        setSelectedDomainId(result.domains[0].id)
      }
    }
    fetchDomains()
  }, [])

  useEffect(() => {
    if (!selectedDomainId) return
    const fetchConfig = async () => {
      setConfigLoading(true)
      const config = await onGetCurrentChatBot(selectedDomainId)
      if (config) {
        setChatbotConfig(config)
        const welcome =
          config.chatBot?.welcomeMessage ??
          `Hi! I'm ${config.name}. How can I help you today?`
        setChats([{ role: 'assistant', content: welcome }])
      }
      setMessageCount(0)
      setConfigLoading(false)
    }
    fetchConfig()
  }, [selectedDomainId])

  const handleReset = () => {
    const welcome =
      chatbotConfig?.chatBot?.welcomeMessage ??
      `Hi! I'm ${chatbotConfig?.name ?? 'your assistant'}. How can I help you?`
    setChats([{ role: 'assistant', content: welcome }])
    setChatroomId(generateUUID())
    setMessageCount(0)
    setImagePreview(null)
    reset()
  }

  const onChat = handleSubmit(async (values) => {
    if (!selectedDomainId || !values.content?.trim()) return
    setChats((prev) => [...prev, { role: 'user', content: values.content! }])
    reset()
    setResponding(true)
    setMessageCount((prev) => prev + 1)

    const response = await onAiChatBotAssistant(
      selectedDomainId,
      chats,
      'user',
      values.content!,
      chatroomId,
      false,
      false,
    )

    setResponding(false)
    if (response?.response) {
      setChats((prev) => [...prev, response.response])
    }
  })

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue('image', e.target.files)
      const reader = new FileReader()
      reader.onload = (event) =>
        setImagePreview(event.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setValue('image', null as unknown as FileList)
  }

  const bot = chatbotConfig?.chatBot

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 border-b">
        <InfoBar />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <FlaskConical className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-2xl font-bold">Playground</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Test your chatbot with real AI responses
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Test Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Domain
                    </label>
                    {domains.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No domains found.</p>
                    ) : (
                      <select
                        value={selectedDomainId}
                        onChange={(e) => setSelectedDomainId(e.target.value)}
                        className="w-full text-sm border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {domains.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {bot && !configLoading && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Active Configuration
                      </p>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <Badge variant="outline" className="text-xs">
                          {bot.widgetSize ?? 'Medium'} size
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {bot.buttonStyle ?? 'Rounded'}
                        </Badge>
                        <div
                          className="h-5 w-5 rounded-full border border-slate-200 flex-shrink-0"
                          style={{ background: bot.backgroundColor ?? '#3B82F6' }}
                          title="Chatbot color"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {chatbotConfig?.helpdesk?.length ?? 0} FAQ questions loaded
                      </p>
                    </div>
                  )}

                  {bot?.customPrompt && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowSystemPrompt((p) => !p)}
                        className="text-xs text-blue-600 hover:text-blue-700 underline"
                      >
                        {showSystemPrompt ? 'Hide' : 'Show'} system prompt
                      </button>
                      {showSystemPrompt && (
                        <pre className="mt-2 text-xs bg-muted p-3 rounded-lg overflow-x-auto whitespace-pre-wrap text-muted-foreground max-h-40">
                          {bot.customPrompt}
                        </pre>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      {messageCount} message{messageCount !== 1 ? 's' : ''} sent
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="h-7 text-xs gap-1.5"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </Button>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Info className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Test conversations don&apos;t count toward your monthly limit
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 self-start flex-wrap">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                  Live Preview
                </span>
                <span className="text-xs text-muted-foreground">
                  Responses powered by your actual AI configuration
                </span>
              </div>

              {selectedDomainId && !configLoading && chatbotConfig ? (
                <BotWindow
                  ref={messageWindowRef}
                  register={register}
                  chats={chats}
                  onChat={onChat as () => void}
                  onResponding={responding}
                  domainName={chatbotConfig.name}
                  domainId={selectedDomainId}
                  theme={bot?.backgroundColor}
                  textColor={bot?.textColor}
                  help={bot?.helpdesk ?? false}
                  realtimeMode={undefined}
                  helpdesk={chatbotConfig.helpdesk}
                  setChat={setChats}
                  imagePreview={imagePreview}
                  onImageChange={onImageChange}
                  removeImage={removeImage}
                  botIcon={bot?.icon ?? undefined}
                  chatbotTitle={bot?.chatbotTitle}
                  chatbotSubtitle={bot?.chatbotSubtitle}
                  userBubbleColor={bot?.userBubbleColor}
                  botBubbleColor={bot?.botBubbleColor}
                  userTextColor={bot?.userTextColor}
                  botTextColor={bot?.botTextColor}
                  buttonStyle={bot?.buttonStyle}
                  bubbleStyle={bot?.bubbleStyle}
                  showAvatars={bot?.showAvatars}
                  widgetSize={bot?.widgetSize}
                  widgetStyle={bot?.widgetStyle}
                  removeBranding={bot?.removeBranding}
                  chatPosition={bot?.chatPosition}
                  showPresenceBadge={bot?.showPresenceBadge ?? false}
                  plan={chatbotConfig.subscription.plan}
                />
              ) : configLoading ? (
                <div className={cn(
                  'flex items-center justify-center border rounded-2xl',
                  'h-[600px] w-[420px] bg-background'
                )}>
                  <p className="text-sm text-muted-foreground">Loading chatbot...</p>
                </div>
              ) : (
                <div className={cn(
                  'flex flex-col items-center justify-center border rounded-2xl gap-3 text-center',
                  'h-[600px] w-[420px] bg-background'
                )}>
                  <FlaskConical className="h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Select a domain to start testing
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaygroundPage
