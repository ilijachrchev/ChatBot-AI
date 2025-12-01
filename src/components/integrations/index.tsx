"use client"
import React from 'react'
import { Card, CardContent, CardDescription } from '../ui/card'
import Image from 'next/image'
import { INTEGRATION_LIST_ITEMS } from '@/constants/integrations'
import IntegrationTrigger from './integrationTrigger'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Lock } from 'lucide-react'

type Props = {
  connections: {
    stripe: boolean
  }
}

const COMING_SOON_INTEGRATIONS = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Sync your contacts and deals with Salesforce CRM',
    icon: '🔵',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Connect with HubSpot for marketing automation',
    icon: '🟠',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync appointments with your Google Calendar',
    icon: '📅',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notifications in your Slack workspace',
    icon: '💬',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Schedule and manage video meetings',
    icon: '🎥',
  },
]

const IntegrationsList = ({ connections }: Props) => {
  return (
    <div className='overflow-y-auto w-full chat-window flex-1 h-0 px-4 md:px-6 pb-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
        {INTEGRATION_LIST_ITEMS.map((item) => {
          const isConnected = connections[item.name]
          
          return (
            <div
              key={item.id}
              className={cn(
                'group relative overflow-hidden',
                'rounded-xl border border-slate-200 dark:border-slate-800',
                'bg-white dark:bg-slate-900/50',
                'p-5 md:p-6',
                'transition-all duration-300',
                'hover:shadow-card-hover hover:border-blue-200 dark:hover:border-blue-800',
                'hover:-translate-y-1'
              )}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className='flex w-full justify-between items-start mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 md:w-14 md:h-14 relative rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 transition-transform duration-200 group-hover:scale-110 flex-shrink-0'>
                      <Image
                        sizes='100vw'
                        src={'/images/stripe.png'}
                        alt={`${item.name} logo`}
                        fill
                        className='object-contain p-2'
                      />
                    </div>
                    <div>
                      <h3 className='text-lg md:text-xl font-bold text-slate-900 dark:text-white capitalize'>
                        {item.name}
                      </h3>
                    </div>
                  </div>

                  <div className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0',
                    isConnected
                      ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  )}>
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Connected
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        Not Connected
                      </>
                    )}
                  </div>
                </div>

                <div className='flex-1 mb-4'>
                  <CardDescription className='text-sm text-slate-600 dark:text-slate-400 leading-relaxed'>
                    {item.description}
                  </CardDescription>
                </div>

                <IntegrationTrigger
                  connections={connections}
                  title={item.title}
                  description={item.modalDescription}
                  logo={item.logo}
                  name={item.name}
                />
              </div>
            </div>
          )
        })}

        {COMING_SOON_INTEGRATIONS.map((integration) => (
          <div
            key={integration.id}
            className={cn(
              'relative overflow-hidden',
              'rounded-xl border border-slate-200 dark:border-slate-800',
              'bg-slate-50 dark:bg-slate-900/30',
              'p-5 md:p-6',
              'opacity-60'
            )}
          >
            <div className="flex flex-col h-full">
              <div className='flex w-full justify-between items-start mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 md:w-14 md:h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0'>
                    <span className="text-2xl md:text-3xl">{integration.icon}</span>
                  </div>
                  <div>
                    <h3 className='text-lg md:text-xl font-bold text-slate-900 dark:text-white'>
                      {integration.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold flex-shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                  Coming Soon
                </div>
              </div>

              <div className='flex-1 mb-4'>
                <p className='text-sm text-slate-600 dark:text-slate-400 leading-relaxed'>
                  {integration.description}
                </p>
              </div>

              <button
                disabled
                className={cn(
                  'w-full py-2.5 rounded-lg',
                  'bg-slate-200 dark:bg-slate-800',
                  'text-slate-500 dark:text-slate-500',
                  'text-sm font-semibold',
                  'cursor-not-allowed'
                )}
              >
                Coming Soon
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default IntegrationsList