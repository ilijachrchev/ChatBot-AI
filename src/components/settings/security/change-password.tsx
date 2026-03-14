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
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        <div className="lg:col-span-1">
          <div className="flex items-start gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--danger)] text-white">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Change Password
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Reset your password to keep your account secure
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={onChangePassword} className="lg:col-span-3">
          <div className="max-w-md flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
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
              <label className="text-sm font-medium text-[var(--text-secondary)]">
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
              <label className="text-sm font-medium text-[var(--text-secondary)]">
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
                  'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]',
                  'hover:from-[var(--primary)] hover:to-[var(--primary-light)]',
                  'text-white font-semibold',
                  'shadow-lg shadow-[var(--primary)]',
                  'transition-all duration-200',
                  'hover:shadow-xl hover:shadow-[var(--primary)]'
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