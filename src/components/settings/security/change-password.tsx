"use client"
import { useChangePassword } from '@/hooks/settings/use-settings'
import React from 'react'
import FormGenerator from '@/components/forms/form-generator'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = Record<string, never>

const ChangePassword = (props: Props) => {
  const { register, errors, onChangePassword, loading } = useChangePassword()

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        <div className="lg:col-span-1">
          <div className="flex items-start gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Change Password
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Reset your password to keep your account secure
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={onChangePassword} className="lg:col-span-3">
          <div className="max-w-md flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <FormGenerator 
                register={register}
                errors={errors}
                name='password'
                placeholder=''
                type='password'
                inputType='input'
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <FormGenerator 
                register={register}
                errors={errors}
                name='password'
                placeholder=''
                type='password'
                inputType='input'
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <FormGenerator 
                register={register}
                errors={errors}
                name='confirmPassword'
                placeholder=''
                type='password'
                inputType='input'
              />
            </div>
            
            <div className="pt-2">
              <Button 
                className={cn(
                  'bg-gradient-to-r from-blue-500 to-blue-600',
                  'hover:from-blue-600 hover:to-blue-700',
                  'text-white font-semibold',
                  'shadow-lg shadow-blue-500/30',
                  'transition-all duration-200',
                  'hover:shadow-xl hover:shadow-blue-500/40'
                )}
              >
                <Loader loading={loading}>Update Password</Loader>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword