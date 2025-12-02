"use client"
import { Separator } from '@/components/ui/separator'
import { useSettings } from '@/hooks/settings/use-settings'
import React from 'react'
import { DomainUpdate } from './domain-update'
import CodeSnippet from './code-snippet'
import EditChatbotIcon from './edit-chatbot-icon'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { Globe, Trash2, Save, MessageSquare, Eye, Code } from 'lucide-react'

const WelcomeMessage = dynamic(
  () => import('./greetings-message').then((props) => props.default),
  { ssr: false }
)

type Props = {
  id: string
  name: string
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
  chatBot: {
    id: string
    icon: string | null
    welcomeMessage: string | null
  } | null
}

const SettingsForm = ({ id, name, plan, chatBot }: Props) => {
  const {
    register,
    onUpdateSettings,
    errors,
    loading,
    onDeleteDomain,
    deleting,
  } = useSettings(id)

  return (
    <form className='flex flex-col gap-6 pb-10 px-4 md:px-6' onSubmit={onUpdateSettings}>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white'>
              <Globe className='h-6 w-6' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-slate-950 dark:text-white'>
                {name}
              </h1>
              <p className='text-sm text-slate-600 dark:text-slate-300'>
                Configure domain settings, customize chatbot appearance, and manage your bot behavior.
              </p>
            </div>
          </div>

          <div className='flex gap-3'>
            <Button 
              onClick={onDeleteDomain}
              type='button'
              variant='outline'
              className='border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              <Loader loading={deleting}>Delete</Loader>
            </Button>

            <Button
              type='submit'
              className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30'
            >
              <Save className='h-4 w-4 mr-2' />
              <Loader loading={loading}>Save</Loader>
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='space-y-6'>
          <div className='rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white'>
                <Globe className='h-5 w-5' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-slate-950 dark:text-white'>
                  Domain Configuration
                </h3>
                <p className='text-sm text-slate-600 dark:text-slate-300'>
                  Set up your custom domain
                </p>
              </div>
            </div>
            <DomainUpdate
              name={name}
              register={register}
              errors={errors} 
            />
          </div>

          <div className='rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white'>
                <Code className='h-5 w-5' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-slate-950 dark:text-white'>
                  Embed Code
                </h3>
                <p className='text-sm text-slate-600 dark:text-slate-300'>
                  Add this snippet to your website
                </p>
              </div>
            </div>
            <CodeSnippet id={id} />
          </div>
        </div>

        <div className='rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white'>
              <Eye className='h-5 w-5' />
            </div>
            <div>
              <h3 className='text-lg font-bold text-slate-950 dark:text-white'>
                Chatbot Preview
              </h3>
              <p className='text-sm text-slate-600 dark:text-slate-300'>
                See how your chatbot looks
              </p>
            </div>
          </div>
          <div className='relative flex justify-center items-center min-h-[400px]'>
            <Image
              src="/images/bot-ui.png"
              alt="Chatbot Preview"
              width={530}
              height={769}
              className='max-w-full h-auto'
            />
          </div>
        </div>
      </div>

      <div className='rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white'>
              <MessageSquare className='h-5 w-5' />
            </div>
            <div>
              <h3 className='text-lg font-bold text-slate-950 dark:text-white'>
                Chatbot Settings
              </h3>
              <p className='text-sm text-slate-600 dark:text-slate-300'>
                Customize your chatbot appearance and messages
              </p>
            </div>
          </div>
          
          {plan !== 'STANDARD' && (
            <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border border-amber-200 dark:border-amber-800'>
              <span className='text-xs font-bold text-amber-900 dark:text-amber-100'>
                ✨ PREMIUM
              </span>
            </div>
          )}
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          <div className='space-y-6'>
            <EditChatbotIcon
              register={register}
              errors={errors}
              chatBot={chatBot} 
            />
            <WelcomeMessage
              message={chatBot?.welcomeMessage}
              register={register}
              errors={errors}
            />
          </div>
        </div>
      </div>
    </form>
  )
}

export default SettingsForm