'use client'
import React, { useEffect, useState } from 'react'
import BreadCrumb from './bread-crumb'
import { Headphones, Star, Trash, Bell, User, Shield, Settings as SettingsIcon, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useClerk, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Props = Record<string, never>

const InfoBar = (props: Props) => {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [customAvatar, setCustomAvatar] = useState<string | null>(null)

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await fetch('/api/user/avatar')
        if (response.ok) {
          const data = await response.json()
          if (data.avatar) {
            setCustomAvatar(data.avatar)
          }
        }
      } catch (error) {
        console.error('Failed to fetch avatar:', error)
      }
    }
    if (user) {
      fetchAvatar()
    }
  }, [user])

  const displayName = [
    user?.firstName ?? '',
    user?.lastName ?? ''
  ].join(' ').trim()

  const onSignOut = () => signOut(() => router.push('/'))

  const avatarUrl = customAvatar || user?.imageUrl

  useEffect(() => {
  if (user) console.log('clerk user from useUser', user)
}, [user])


  return (
    <div className="flex w-full justify-between items-start md:items-center py-3 md:py-4 mb-4 md:mb-6 gap-4 flex-col md:flex-row">
      <BreadCrumb />
      
      <div className="flex gap-2 md:gap-3 items-center">
        <div className="flex gap-2">
          <button 
            className={cn(
              "h-9 w-9 md:h-10 md:w-10 rounded-lg",
              "border border-slate-200 dark:border-slate-700",
              "bg-white dark:bg-slate-900",
              "hover:bg-slate-50 dark:hover:bg-slate-800",
              "hover:border-rose-300 dark:hover:border-rose-700",
              "transition-all duration-200",
              "flex items-center justify-center group"
            )}
          >
            <Trash className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-rose-500 transition-colors" />
          </button>
          
          <button 
            className={cn(
              "h-9 w-9 md:h-10 md:w-10 rounded-lg",
              "border border-slate-200 dark:border-slate-700",
              "bg-white dark:bg-slate-900",
              "hover:bg-slate-50 dark:hover:bg-slate-800",
              "hover:border-amber-300 dark:hover:border-amber-700",
              "transition-all duration-200",
              "flex items-center justify-center group"
            )}
          >
            <Star className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-amber-500 transition-colors" />
          </button>
        </div>

        <div className="relative">
          <button 
            className={cn(
              "h-9 w-9 md:h-10 md:w-10 rounded-lg",
              "border border-slate-200 dark:border-slate-700",
              "bg-white dark:bg-slate-900",
              "hover:bg-slate-50 dark:hover:bg-slate-800",
              "hover:border-blue-300 dark:hover:border-blue-700",
              "transition-all duration-200",
              "flex items-center justify-center group"
            )}
          >
            <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
          </button>
          <span className={cn(
            "absolute -top-1 -right-1",
            "h-5 w-5 rounded-full",
            "bg-gradient-to-br from-rose-500 to-rose-600",
            "text-white text-xs font-semibold",
            "flex items-center justify-center",
            "shadow-lg shadow-rose-500/50",
            "ring-2 ring-white dark:ring-slate-900"
          )}>
            3
          </span>
        </div>

        <Avatar className={cn(
          "h-9 w-9 md:h-10 md:w-10",
          "ring-2 ring-offset-2 ring-blue-500/20",
          "hover:ring-blue-500/40",
          "transition-all cursor-pointer",
          "ring-offset-white dark:ring-offset-slate-950"
        )}>
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <Headphones className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className={cn(
              "h-9 w-9 md:h-10 md:w-10",
              "ring-2 ring-offset-2 ring-slate-200 dark:ring-slate-700",
              "hover:ring-blue-500/40",
              "transition-all cursor-pointer",
              "ring-offset-white dark:ring-offset-slate-950"
            )}>
              <AvatarImage src={avatarUrl || undefined} alt={displayName || 'User'} className='object-cover' />
              <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-white font-semibold">
                {displayName.charAt(0) ||
                  user?.emailAddresses[0]?.emailAddress.charAt(0) ||
                  'U'}              
                </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end' className='w-64 p-2'>
            <DropdownMenuLabel className='pb-3'>
              <div className='flex items-center gap-3'>
                <Avatar className='w-12 h-12'>
                  <AvatarImage src={avatarUrl || undefined} alt={displayName || 'User'} className='object-cover' />
                  <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-lg'>
                    {displayName.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col overflow-hidden'>
                  <p className='font-semibold text-sm truncate'>
                    {displayName || 'User'}
                  </p>
                  <p className='text-xs text-muted-foreground truncate'>
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild className='cursor-pointer'>
              <Link href='/account/profile' className='flex items-center gap-3 px-2 py-2.5 rounded-md'>
                <div className='w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center'>
                  <User className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm font-medium'>Profile</span>
                  <span className='text-xs text-muted-foreground'>Personal information</span>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className='cursor-pointer'>
              <Link href='/account/security' className='flex items-center gap-3 px-2 py-2.5 rounded-md'>
                <div className='w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center'>
                  <Shield className='w-4 h-4 text-purple-600 dark:text-purple-400' />
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm font-medium'>Security</span>
                  <span className='text-xs text-muted-foreground'>Password & authentication</span>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className='cursor-pointer'>
              <Link href='/account/preferences' className='flex items-center gap-3 px-2 py-2.5 rounded-md'>
                <div className='w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center'>
                  <SettingsIcon className='w-4 h-4 text-amber-600 dark:text-amber-400' />
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm font-medium'>Preferences</span>
                  <span className='text-xs text-muted-foreground'>Notifications & settings</span>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={onSignOut}
              className='cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10'
            >
              <div className='flex items-center gap-3 px-2 py-2.5 w-full rounded-md'>
                <div className='w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center'>
                  <LogOut className='w-4 h-4 text-red-600 dark:text-red-400' />
                </div>
                <span className='text-sm font-medium'>Sign Out</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default InfoBar