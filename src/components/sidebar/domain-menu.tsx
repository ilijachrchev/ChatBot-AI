import { useDomain } from '@/hooks/sidebar/use-domain'
import { cn } from '@/lib/utils'
import React from 'react'
import AppDrawer from '../drawer'
import { CheckCircle2, Clock, Plus, XCircle } from 'lucide-react'
import { Loader } from '../loader'
import FormGenerator from '../forms/form-generator'
import UploadButton from '../upload-button'
import { Button } from '../ui/button'
import Link from 'next/link'
import { FieldValues, UseFormRegister } from 'react-hook-form'

type Props = {
  min?: boolean
  domains:
    | {
        id: string
        name: string
        icon: string | null
        verificationStatus?: string
      }[]
    | null
    | undefined
}

const getVerificationIcon = (status?: string) => {
  switch (status) {
    case 'VERIFIED':
      return <CheckCircle2 className="w-3 h-3 text-green-500" />
    case 'FAILED':
      return <XCircle className="w-3 h-3 text-red-500" />
    case 'PENDING':
    default:
      return <Clock className="w-3 h-3 text-amber-500" />
  }
}

const DomainMenu = ({ domains, min }: Props) => {
  const { register, onAddDomain, loading, errors, isDomain } = useDomain()

  return (
    <div className={cn('flex flex-col gap-1.5 md:gap-2', min ? 'mt-2 md:mt-4' : 'mt-1.5 md:mt-2')}>
      <div className="flex justify-between w-full items-center">
        {!min && (
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Domains
          </p>
        )}

        <AppDrawer
          description="Add in your domain address to integrate your chatbot"
          title="Add your business domain"
          onOpen={
            <div 
              className={cn(
                'group relative',
                'flex items-center justify-center',
                'w-8 h-8 rounded-lg',
                'border-2 border-dashed border-[var(--border-strong)]',
                'text-[var(--text-muted)] dark:text-[var(--text-secondary)]',
                'hover:border-indigo-400 hover:text-indigo-400 hover:bg-indigo-950/30',
                'transition-all duration-200',
                'cursor-pointer'
              )}>
                <Plus className='w-4 h-4' />
            </div>
          }
        >
          <Loader loading={loading}>
            <form
              className="mt-3 w-full flex flex-col gap-4"
              onSubmit={onAddDomain}
            >
              <FormGenerator
                inputType="input"
                register={register as unknown as UseFormRegister<FieldValues>}
                label="Domain"
                name="domain"
                errors={errors}
                placeholder="mydomain.com"
                type="text"
              />
              <UploadButton
                register={register}
                label="Upload Icon (Optional)" 
                errors={errors}
              />
              <Button
                type="submit"
                className="w-full"
              >
                Add Domain
              </Button>
            </form>
          </Loader>
        </AppDrawer>
      </div>
      <div className="flex flex-col gap-1">
        {domains &&
          domains.map((domain) => {
            const raw = (domain.icon ?? '').trim()
            const empty = !raw || raw === 'null' || raw === 'undefined' || raw === '/favicon.ico'

            const iconSrc = empty
              ? '/favicon.ico'
              : raw.startsWith('http')
                ? raw
                : raw.startsWith('/')
                  ? raw 
                  : `https://ucarecdn.com/${raw}/-/preview/` 

            const isActive = domain.name.split('.')[0] === isDomain

            if (!min) {
              return (
                <Link
                  href={`/settings/${domain.name.split('.')[0]}`}
                  key={domain.id}
                  className={cn(
                    'group relative',
                    'flex items-center md:gap-3 gap-2 md:px-3 px-2 md:py-2.5 py-1.5 rounded-lg',
                    'transition-all duration-200 ease-in-out',
                    'overflow-hidden',
                    
                    isActive && [
                      'bg-[var(--bg-active)]',
                      'font-semibold text-[var(--text-primary)]',
                      'shadow-sm',
                      'before:absolute before:left-0 before:top-0 before:bottom-0',
                      'before:w-1 before:bg-gradient-to-b before:from-indigo-500 before:to-indigo-600',
                      'before:rounded-l-lg'
                    ],
                    
                    !isActive && [
                      'text-[var(--text-secondary)]',
                      'hover:bg-[var(--bg-hover)]',
                      'hover:text-[var(--text-primary)]'
                    ]
                  )}
                >
                  <div className={cn(
                    'relative flex-shrink-0',
                    'md:w-8 md:h-8 w-7 h-7 rounded-lg overflow-hidden',
                    'border-2 transition-all duration-200',
                    'group-hover:scale-105',
                    
                    isActive 
                      ? 'border-[var(--border-accent)] shadow-sm' 
                      : 'border-[var(--border-default)] group-hover:border-indigo-400'
                  )}>
                    <img
                      src={iconSrc}
                      alt={`${domain.name} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => { 
                        e.currentTarget.src = '/favicon.ico'
                      }}
                    />
                  </div>

                  <span className="text-sm truncate flex-1">
                    {domain.name}
                  </span>

                  {getVerificationIcon(domain.verificationStatus)}

                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </Link>
              )
            }

            return (
              <Link
                href={`/settings/${domain.name.split('.')[0]}`}
                key={domain.id}
                className={cn(
                  'group relative',
                  'flex flex-col items-center justify-center rounded-lg py-2.5',
                  'transition-all duration-200 ease-in-out',
                  
                  isActive && [
                    'bg-[var(--bg-active)]',
                    'shadow-sm',
                  ],
                  
                  !isActive && [
                    'hover:bg-[var(--bg-hover)]',
                  ]
                )}
              >
                <div className={cn(
                  'relative flex-shrink-0',
                  'w-7 h-7 rounded-lg overflow-hidden',
                  'border-2 transition-all duration-200',
                  'group-hover:scale-110',
                  
                  isActive 
                    ? 'border-[var(--border-accent)]' 
                    : 'border-[var(--border-default)] group-hover:border-indigo-400'
                )}>
                  <img
                    src={iconSrc}
                    alt={`${domain.name} logo`}
                    className="w-full h-full object-cover"
                    onError={(e) => { 
                      e.currentTarget.src = '/favicon.ico'
                    }}
                  />
                  <div className="absolute -top-0.5 -right-0.5">
                    {getVerificationIcon(domain.verificationStatus)}
                  </div>
                </div>

                {isActive && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" />
                )}

                <div className={cn(
                  'absolute left-full ml-2 px-2 py-1 rounded-md',
                  'bg-slate-900 dark:bg-[var(--bg-active)] text-white text-xs whitespace-nowrap',
                  'opacity-0 group-hover:opacity-100 pointer-events-none',
                  'transition-opacity duration-200 z-50'
                )}>
                  {domain.name}
                </div>
              </Link>
            )
          })}
      </div>
    </div>
  )
}

export default DomainMenu