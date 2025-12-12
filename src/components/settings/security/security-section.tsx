'use client'

import React from 'react'
import { Shield, Key, Lock } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import ChangePasswordCard from '@/components/account/change-password-card' 

export function SecuritySection() {
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
                <Key className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                <h4 className='text-sm font-semibold text-slate-900 dark:text-white'>
                  Password
                </h4>
              </div>
              <p className='text-xs text-slate-600 dark:text-slate-400'>
                Last changed recently
              </p>
            </div>

            <div className='p-4 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800'>
              <div className='flex items-center gap-3 mb-2'>
                <Shield className='w-5 h-5 text-green-600 dark:text-green-400' />
                <h4 className='text-sm font-semibold text-slate-900 dark:text-white'>
                  Account Status
                </h4>
              </div>
              <p className='text-xs text-slate-600 dark:text-slate-400'>
                All security checks passed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ChangePasswordCard />

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

      <Card className='border-slate-200 dark:border-slate-800'>
        <CardHeader>
          <CardTitle className='text-lg'>Active Sessions</CardTitle>
          <CardDescription>
            Manage devices logged into your account (Coming Soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center'>
            <Shield className='w-12 h-12 text-slate-400 mx-auto mb-3' />
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Session management features coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}