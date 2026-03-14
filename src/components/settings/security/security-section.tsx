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
      <Card className='border-[var(--border-default)]'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-xl bg-[var(--bg-page)] dark:bg-white flex items-center justify-center'>
              <Shield className='w-6 h-6 text-[var(--text-primary)]' />
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
            <div className='p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)]'>
              <div className='flex items-center gap-3 mb-2'>
                <Mail className='w-5 h-5 text-[var(--text-secondary)]' />
                <h4 className='text-sm font-semibold text-[var(--text-primary)]'>
                  Email
                </h4>
              </div>
              <p className='text-xs text-[var(--text-secondary)]'>
                Verified and secure
              </p>
            </div>

            <div className='p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)]'>
              <div className='flex items-center gap-3 mb-2'>
                <Key className='w-5 h-5 text-[var(--success)] dark:text-[var(--success)]' />
                <h4 className='text-sm font-semibold text-[var(--text-primary)]'>
                  Password
                </h4>
              </div>
              <p className='text-xs text-[var(--text-secondary)]'>
                Strong protection enabled
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='border-[var(--border-default)]'>
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
              className='h-11 bg-[var(--bg-card)] cursor-not-allowed'
            />
            <p className='text-xs text-[var(--text-muted)]'>
              Your email is managed by Clerk and cannot be changed here
            </p>
          </div>
        </CardContent>
      </Card>

      <ChangePasswordCard />

      <Card className='border-[var(--border-default)]'>
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
                  className='text-[var(--danger)] hover:text-[var(--danger)] hover:bg-[var(--danger)] dark:hover:bg-[var(--danger)] border-[var(--danger)] dark:border-[var(--danger)]'
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
              <div className='w-8 h-8 border-2 border-[var(--border-strong)] dark:border-white border-t-transparent rounded-full animate-spin mx-auto' />
              <p className='text-sm text-[var(--text-secondary)] mt-3'>
                Loading sessions...
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className='text-center py-8'>
              <Monitor className='w-12 h-12 text-[var(--text-muted)] mx-auto mb-3' />
              <p className='text-sm font-medium text-[var(--text-primary)] mb-1'>
                Only one active session
              </p>
              <p className='text-xs text-[var(--text-secondary)]'>
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
                        ? 'bg-[var(--bg-page)] dark:bg-white border-[var(--border-strong)] dark:border-white'
                        : 'bg-[var(--bg-card)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
                    )}
                  >
                    <div className='flex items-center gap-4'>
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          isCurrentSession
                            ? 'bg-white/10 dark:bg-[var(--bg-page)]/10'
                            : 'bg-[var(--bg-card)]'
                        )}
                      >
                        <DeviceIcon
                          className={cn(
                            'w-5 h-5',
                            isCurrentSession
                              ? 'text-[var(--text-primary)]'
                              : 'text-[var(--text-secondary)]'
                          )}
                        />
                      </div>
                      <div>
                        <div className='flex items-center gap-2'>
                          <span className={cn(
                            'text-sm font-medium',
                            isCurrentSession
                              ? 'text-[var(--text-primary)]'
                              : 'text-[var(--text-primary)]'
                          )}>
                            {session.latestActivity?.browserName || 'Browser'}{' '}
                            {session.latestActivity?.browserVersion && `v${session.latestActivity.browserVersion}`}
                            {' on '}
                            {session.latestActivity?.deviceType || 'Device'}
                          </span>
                          {isCurrentSession && (
                            <span className='px-2 py-0.5 bg-white/20 dark:bg-[var(--bg-page)]/20 text-[var(--text-primary)] text-xs font-medium rounded-full'>
                              Current
                            </span>
                          )}
                        </div>
                        <p className={cn(
                          'text-xs mt-0.5',
                          isCurrentSession
                            ? 'text-[var(--text-muted)]'
                            : 'text-[var(--text-secondary)]'
                        )}>
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
                        className='text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger)] dark:hover:bg-[var(--danger)]'
                      >
                        {isRevoking ? (
                          <div className='w-4 h-4 border-2 border-[var(--danger)] border-t-transparent rounded-full animate-spin' />
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

      <Card className='border-[var(--border-default)]'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg bg-[rgba(224,155,26,0.15)] flex items-center justify-center'>
              <Lock className='w-5 h-5 text-[var(--warning)] dark:text-[var(--warning)]' />
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
          <div className='p-6 bg-[var(--bg-card)] rounded-xl border border-dashed border-[var(--border-strong)] text-center'>
            <Shield className='w-12 h-12 text-[var(--text-muted)] mx-auto mb-3' />
            <p className='text-sm text-[var(--text-secondary)]'>
              Two-factor authentication will be available soon to further
              protect your account
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}