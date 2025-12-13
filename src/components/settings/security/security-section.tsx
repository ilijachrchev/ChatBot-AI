'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Key, Lock, Mail, Monitor, Smartphone, Laptop, LogOut, RefreshCw } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import ChangePasswordCard from '@/components/account/change-password-card'
import EmailStatus from '@/components/account/email-status'
import { useUser, useSession } from '@clerk/nextjs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function SecuritySection() {
  const { user } = useUser()
  const { session: currentSession } = useSession()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)
  
  const userEmail = user?.primaryEmailAddress?.emailAddress || ''

  useEffect(() => {
    loadSessions()
  }, [user])

  const loadSessions = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      const response = await fetch('/api/sessions', {
        method: 'GET',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }
      
      const data = await response.json()
      console.log('📱 All Sessions:', data.sessions)
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Error loading sessions:', error)
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    if (sessionId === currentSession?.id) {
      toast.error('Cannot revoke current session')
      return
    }

    setRevoking(sessionId)
    
    try {
      const response = await fetch('/api/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to revoke session')
      }
      
      toast.success('Session revoked successfully')
      await loadSessions()
    } catch (error) {
      console.error('Error revoking session:', error)
      toast.error('Failed to revoke session')
    } finally {
      setRevoking(null)
    }
  }

  const handleRevokeAllSessions = async () => {
    const otherSessions = sessions.filter(s => s.id !== currentSession?.id)
    
    if (otherSessions.length === 0) {
      toast.error('No other sessions to revoke')
      return
    }

    try {
      setLoading(true)
      
      await Promise.all(
        otherSessions.map(session => 
          fetch('/api/sessions', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId: session.id }),
          })
        )
      )
      
      toast.success(`Revoked ${otherSessions.length} session${otherSessions.length > 1 ? 's' : ''}`)
      await loadSessions()
    } catch (error) {
      console.error('Error revoking all sessions:', error)
      toast.error('Failed to revoke all sessions')
    } finally {
      setLoading(false)
    }
  }

  const getDeviceIcon = (deviceType?: string) => {
    const type = deviceType?.toLowerCase() || ''
    if (type.includes('mobile') || type.includes('phone')) return Smartphone
    if (type.includes('desktop')) return Monitor
    return Laptop
  }

  const formatLastActive = (date: Date | number | string) => {
    const lastActive = typeof date === 'number' ? date : new Date(date).getTime()
    const now = Date.now()
    const diff = now - lastActive
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Active now'
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  return (
    <div className='space-y-6'>
      <Card className='border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20'>
              <Shield className='w-6 h-6 text-white' />
            </div>
            <div>
              <CardTitle className='text-xl'>Account Security</CardTitle>
              <CardDescription>
                Keep your account safe and secure
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='p-4 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800'>
              <div className='flex items-center gap-3 mb-2'>
                <Mail className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                <h4 className='text-sm font-semibold text-slate-900 dark:text-white'>
                  Email
                </h4>
              </div>
              <p className='text-xs text-slate-600 dark:text-slate-400'>
                Verified and secure
              </p>
            </div>

            <div className='p-4 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800'>
              <div className='flex items-center gap-3 mb-2'>
                <Key className='w-5 h-5 text-green-600 dark:text-green-400' />
                <h4 className='text-sm font-semibold text-slate-900 dark:text-white'>
                  Password
                </h4>
              </div>
              <p className='text-xs text-slate-600 dark:text-slate-400'>
                Strong protection enabled
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='border-slate-200 dark:border-slate-800'>
        <CardHeader>
          <CardTitle className='text-lg'>Account Information</CardTitle>
          <CardDescription>
            Your login credentials and email address
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email' className='text-sm font-medium'>
              Email Address <EmailStatus />
            </Label>
            <Input
              id='email'
              type='email'
              value={userEmail}
              disabled
              className='h-11 bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed'
            />
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Your email is managed by Clerk and cannot be changed here
            </p>
          </div>
        </CardContent>
      </Card>

      <ChangePasswordCard />

      <Card className='border-slate-200 dark:border-slate-800'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-lg'>Active Sessions</CardTitle>
              <CardDescription>
                Manage devices logged into your account
              </CardDescription>
            </div>
            <div className='flex gap-2'>
              <Button
                onClick={loadSessions}
                variant='outline'
                size='sm'
                disabled={loading}
              >
                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              </Button>
              {sessions.length > 1 && (
                <Button
                  onClick={handleRevokeAllSessions}
                  variant='outline'
                  size='sm'
                  disabled={loading}
                  className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800'
                >
                  <LogOut className='w-4 h-4 mr-2' />
                  Revoke All Others
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='text-center py-8'>
              <div className='w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto' />
              <p className='text-sm text-slate-600 dark:text-slate-400 mt-3'>
                Loading sessions...
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className='text-center py-8'>
              <Monitor className='w-12 h-12 text-slate-400 mx-auto mb-3' />
              <p className='text-sm font-medium text-slate-900 dark:text-white mb-1'>
                Only one active session
              </p>
              <p className='text-xs text-slate-600 dark:text-slate-400'>
                You're currently logged in on this device only
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {sessions.map((session: any) => {
                const DeviceIcon = getDeviceIcon(session.latestActivity?.deviceType)
                const isCurrentSession = session.id === currentSession?.id
                const isRevoking = revoking === session.id

                return (
                  <div
                    key={session.id}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-xl border transition-all',
                      isCurrentSession
                        ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    )}
                  >
                    <div className='flex items-center gap-4'>
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          isCurrentSession
                            ? 'bg-blue-100 dark:bg-blue-900/30'
                            : 'bg-slate-100 dark:bg-slate-800'
                        )}
                      >
                        <DeviceIcon
                          className={cn(
                            'w-5 h-5',
                            isCurrentSession
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-slate-600 dark:text-slate-400'
                          )}
                        />
                      </div>
                      <div>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium text-slate-900 dark:text-white'>
                            {session.latestActivity?.browserName || 'Browser'}{' '}
                            {session.latestActivity?.browserVersion && `v${session.latestActivity.browserVersion}`}
                            {' on '}
                            {session.latestActivity?.deviceType || 'Device'}
                          </span>
                          {isCurrentSession && (
                            <span className='px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full'>
                              Current
                            </span>
                          )}
                        </div>
                        <p className='text-xs text-slate-600 dark:text-slate-400 mt-0.5'>
                          {session.latestActivity?.city && session.latestActivity?.country
                            ? `${session.latestActivity.city}, ${session.latestActivity.country}`
                            : session.latestActivity?.ipAddress || 'Unknown location'}{' '}
                          • {formatLastActive(session.lastActiveAt)}
                        </p>
                      </div>
                    </div>
                    {!isCurrentSession && (
                      <Button
                        onClick={() => handleRevokeSession(session.id)}
                        variant='ghost'
                        size='sm'
                        disabled={isRevoking}
                        className='text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                      >
                        {isRevoking ? (
                          <div className='w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin' />
                        ) : (
                          <LogOut className='w-4 h-4' />
                        )}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className='border-slate-200 dark:border-slate-800'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center'>
              <Lock className='w-5 h-5 text-amber-600 dark:text-amber-400' />
            </div>
            <div>
              <CardTitle className='text-lg'>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security (Coming Soon)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center'>
            <Shield className='w-12 h-12 text-slate-400 mx-auto mb-3' />
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Two-factor authentication will be available soon to further
              protect your account
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}