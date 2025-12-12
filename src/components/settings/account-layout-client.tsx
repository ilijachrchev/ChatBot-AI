'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SettingsSidebar } from './settings-sidebar'
import { usePathname } from 'next/navigation'

interface AccountLayoutClientProps {
  user: {
    id: string
    fullname: string
    email: string
    imageUrl: string
  }
  children: React.ReactNode
}

const sectionTitles: Record<string, { title: string; description: string }> = {
  '/account/profile': {
    title: 'Profile Settings',
    description: 'Manage your personal information and profile picture',
  },
  '/account/security': {
    title: 'Security',
    description: 'Password & authentication settings',
  },
  '/account/preferences': {
    title: 'Preferences',
    description: 'Customize your experience',
  },
}

export function AccountLayoutClient({ user, children }: AccountLayoutClientProps) {
  const pathname = usePathname()
  const config = sectionTitles[pathname || '/account/profile'] || {
    title: 'Account Settings',
    description: 'Manage your account preferences',
  }

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950 flex'>
      <SettingsSidebar
        userName={user.fullname}
        userEmail={user.email}
        userAvatar={user.imageUrl}
      />

      <main className='flex-1 lg:ml-0'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12'>
          <div className='mb-8'>
            <Link
              href='/dashboard'
              className='inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 group'
            >
              <ArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
              Back to Dashboard
            </Link>
            <h1 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2'>
              {config.title}
            </h1>
            <p className='text-slate-600 dark:text-slate-400'>
              {config.description}
            </p>
          </div>

          <div>{children}</div>
        </div>
      </main>
    </div>
  )
}